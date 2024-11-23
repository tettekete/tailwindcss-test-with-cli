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

const throttle_sec= 1;

function findFiles( dir ,regex_patterns = [/.+/],ignore_patterns = [] ,found_files = [] )
{
	const files = fs.readdirSync(dir);

	files.forEach((file) =>
	{
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory())
		{
			findFiles(filePath, regex_patterns , ignore_patterns , found_files );
		}
		else
		{
			if( ignore_patterns.length > 0 )
			{
				for( const regex of ignore_patterns )
				{
					if( regex.test( filePath ) )
					{
						return;
					}
				}
			}

			for( const regex of regex_patterns )
			{
				if( regex.test( filePath ) )
				{
					found_files.push( filePath );
					continue;
				}
			}
		}
	});

	return found_files;
}

/*
	仕様:

	1. 前回の処理実行タイムから throttle_sec 秒以上経過していたら即座に実行し、
	その後 throttle_sec 秒間のリクエストを破棄する。

	最後の実行から throttle_sec 秒間の間に本当に更新の必要がある呼び出しがあった場合
	問題になるが、throttle_sec が十分に短い時間に設定すれば作業に支障は出ないはず。

	この仕様にしないと大量のリクエストが一気に来たとき、どうしても初回の即時実行と
	throttle_sec 秒後の遅延実行の 2 回の実行が必ず発生してしまう。
	確実性の意味ではこの仕様の方が良いケースもあるが、それならば遅延実行だけにした方が
	良い事になる。

	ワークフロー的には「throttle_sec 秒以上経過していたら即座に実行する」の方が重要と
	判断した。
*/
function get_throttle_executor( throttle_sec , callback )
{
	let _last_dispatch_time = 0;
	let _restriction_end_time = 0;
	let _throttle_time = throttle_sec * 1000;
	let _call_count = 0;
	
	return (...args) => {
		_call_count ++;

		if( Date.now() - _restriction_end_time <= 0  )
		{
			return;
		}
		else if( Date.now() - _last_dispatch_time > _throttle_time )
		{
			_last_dispatch_time		= Date.now();
			_restriction_end_time	= _last_dispatch_time + _throttle_time;

			console.debug(`call_count: ${_call_count}`);
			_call_count = 0;

			callback( ...args );
		}
	}
}


function buildWithTailwindcss( file_path , srcCssFiles )
{
	for(const css_file of srcCssFiles )
	{
		execTailwindcssCommand( css_file );
	}
}

function execTailwindcssCommand( file_path )
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

(()=>
{
	// コマンド引数から対象ディレクトリを受け取るかデフォルトパスをセットします
	const targetDir = process.argv[2] || path.join( __dirname ,'../' , 'docs');

	// 監視対象となるファイルの拡張子を定義します
	const allow_ext_list = ['.src.css' , '.html' ,'.js'];

	// tailwindcss ビルド対象ファイルを対象ディレクトリから取り出します。
	const srcCssFiles = findFiles( targetDir , [/\.src\.css$/] );

	// chokidar を初期化します
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
		}
	);

	// 監視対象数に対して実際に処理を行う頻度を抑えるため、スロットリング関数を作ります
	// (特に chokidar の初回起動時、全てのファイルに add もしくは change イベントが
	// あったと見なすため、ファイル数と同じ回数同じビルドを行ってしまう。また普通に
	// 複数のファイル保存を一度に行った場合も同様に同じビルドを複数回行ってしまうのを
	// 抑えるための処置)
	const css_builder = get_throttle_executor( throttle_sec , buildWithTailwindcss )

	watcher
		.on('add',	(path) => {css_builder(path , srcCssFiles )})
		.on('change',	(path) => {css_builder(path , srcCssFiles )});

})()
