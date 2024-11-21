const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { execFile } = require('child_process');

/*
global.src.css と　tailwind.min.src.css は --content 指定をしない。
本プロジェクト内で使用されている TailwindCSS スタイルを書きだしてしまって
構わないので。

	e.g.)
	taiwindcss -i global.src.css　-o global.css

それ以外の *.src.css は --content で対応する HTML ファイルを指定することで
全ての HTML 内の TailwindCSS スタイルをスキャンしないように制約する。

	e.g.)
	taiwindcss -i docs/forms/buttons-like-bootstrap.src.css \
		-o docs/forms/buttons-like-bootstrap.css\
		--content docs/forms/buttons-like-bootstrap.html

*/

function buildWithTailwindcss( file_path )
{
	let content_option = undefined;
	switch( path.basename( file_path ) )
	{
		case 'global.src.css':
		case 'tailwind.min.src.css':
			break;

		default:
			content_option = file_path.replace( /\.src\.css$/i ,'.html' );
			break;
	}

	const dest_file = file_path.replace( /\.src\.css$/i ,'.css' );

	if( dest_file === file_path )
	{
		return false;
	}

	const command = [
			'tailwindcss',
			'-i',
			file_path,
			'-o',
			dest_file
		]
	
	if( content_option )
	{
		command.push( '--content' );
		command.push( content_option );
		
		console.log(`build: "${file_path}" for ${content_option}`);
	}
	else
	{
		console.log(`build: "${file_path}" for all HTML`);
	}

	execFile('npx',
		command,
		(error, stdout, stderr) =>
		{
			if (error)
			{
				console.error(`Error: ${error.message}`);
				return false;
			}

			if (stderr)
			{
				console.error(`STDERR: ${stderr}`);
				return false;
			}
			
			console.log(`Output: ${stdout}`);
		});
	
	return true;
}

const targetDir = process.argv[2] || path.join( __dirname ,'../' , 'docs');
const allow_ext_list = ['.src.css' , '.html' ,'.js'];

const watcher = chokidar.watch(
	targetDir,
	{
		ignored: (_path, stats) => {
			// ファイルじゃない = undefined or directory は無視しない
			if( ! stats?.isFile() ) {return false }

			// 隠しファイルは無視
			const basename = path.basename( _path );
			if( typeof basename === 'string' && basename.startsWith( '.' ) )
			{
				return true
			}

			// 監視対象の拡張子なら無視しない
			for( const allow_ext of allow_ext_list )
			{
				if( _path.endsWith( allow_ext ))
				{
					return false;
				}
			}

			// それ以外は無視
			return true;
		},
		persistent: true
	});

watcher
  .on('add',	(path) => {buildWithTailwindcss(path)})
  .on('change',	(path) => {buildWithTailwindcss(path)});
