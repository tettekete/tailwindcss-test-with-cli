const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { execFile } = require('child_process');

/*

# 本スクリプトの概要

プロジェクト内のファイルの変更を監視し以下の処理を行うスクリプトです。

- プロジェクト全体(`./docs`)向けの `.src.css` ファイルを tailwindcss でビルドする
- HTML ファイルと 1:1 になる `*.src.css` からその HTML 専用の CSS を tailwindcss でビルドする

## 背景

tailwindcss コマンドは単一の入力・出力ファイルでの --watch しかできないため、
HTML と 1:1 となる CSS のビルドが必要になるとその数だけシェルを立ち上げる必要があります。

これを一つのシェルで完結させるために本スクリプトは開発されました。

制約として全ての tailwind ソースとなる css ファイルの拡張子は `.src.css` である必要があります。


## 動作の機序

監視対象ファイルは `['.src.css' , '.html' ,'.js']` ですがそれらは変更の検知にのみ
使われます。

実際にビルドの基準となる css ファイルは予め探索しておいた `*.src.css` ファイルとなります。

### 全体をカバーする `.src.css` ファイル

`global.src.css` と　`tailwind.min.src.css` はプロジェクト全体をカバーする
tailwindcss のソース css です。

つまり、`tailwind.config.js` で定義されたファイル全てを参照して使用されている
css から tailwindcss のビルドを行います。

	e.g.)
	taiwindcss -i global.src.css　-o global.css


### 1:1 となるファイルのビルド

1:1 となるファイルは事前に探索済みの `*.src.css` とベースネームが同じ HTML ファイルで、
そのファイルに限定したビルドを行う為に --content オプションでその HTML を指定して
ビルドが行われます。

	e.g.)
	taiwindcss -i docs/forms/buttons-like-bootstrap.src.css \
		-o docs/forms/buttons-like-bootstrap.css\
		--content docs/forms/buttons-like-bootstrap.html



*/

const throttle_sec= 1;


/**
 * 指定されたディレクトリ内のファイルを検索し、条件に一致するファイルパスを取得します。
 *
 * ignore_patterns は regex_patterns に優先して評価されます。
 *
 * @param {string} dir - 検索を開始するディレクトリのパス。
 * @param {RegExp[]} [regex_patterns=[/.+/]] - 一致するファイルパスを決定する正規表現パターンの配列。
 * @param {RegExp[]} [ignore_patterns=[]] - 無視するファイルパスを決定する正規表現パターンの配列。
 * @param {string[]} [found_files=[]] - 検索結果として収集されるファイルパスを格納する配列。
 * @returns {string[]} 検索条件に一致したファイルパスの配列。
 *
 * @example
 * // ディレクトリ内のすべてのJavaScriptファイルを取得
 * const jsFiles = findFiles('/path/to/dir', [/\.js$/]);
 *
 * @example
 * // 特定のファイルを無視して検索
 * const result = findFiles('/path/to/dir', [/\.css$/], [/ignore-this-file\.css$/]);
 */
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

*/
/**
 * スロットリングされた関数を生成します。
 * 指定した秒数内に複数回呼び出されても、最初の呼び出しのみ実行し、次の実行は指定秒数後に許可されます。
 *
 * 仕様:
 * 
 * 前回の処理実行タイムから throttle_sec 秒以上経過していたら即座に実行し、
 * その後 throttle_sec 秒間のリクエストを破棄する。
 * 
 * 最後の実行から throttle_sec 秒間の間に本当に更新の必要がある呼び出しがあった場合
 * 問題になるが、throttle_sec が十分に短い時間に設定すれば作業に支障は出ないはず。
 * 
 * この仕様にしないと大量のリクエストが一気に来たとき、どうしても初回の即時実行と
 * throttle_sec 秒後の遅延実行の 2 回の実行が必ず発生してしまう。
 * 確実性の意味ではその仕様の方が良いケースもあるが、それならば遅延実行だけにした方が
 * 良い事になる。
 * 
 * ワークフロー的には「throttle_sec 秒以上経過していたら即座に実行する」の方が重要と
 * 判断した。
 *
 * @param {number} throttle_sec - スロットリングの間隔を秒単位で指定します。
 * @param {Function} callback - スロットリングされた後に実行されるコールバック関数。
 * @returns {Function} スロットリングされた関数。この関数は任意の引数を受け取り、コールバック関数に引き渡します。
 *
 * @example
 * const throttledFunction = get_throttle_executor(2, () => {
 *   console.log('Executed!');
 * });
 *
 * // 連続で関数を呼び出しても、2秒間隔で1回だけ実行される
 * throttledFunction();
 * throttledFunction();
 */
function get_throttle_executor( throttle_sec , callback )
{
	let _last_dispatch_time = 0;
	let _restriction_end_time = 0;
	let _throttle_time = throttle_sec * 1000;
	let _call_count = 0;
	
	return (...args) => {
		_call_count ++;	// for debug

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
	let srcCssFiles = findFiles( targetDir , [/\.src\.css$/] );

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
		.on('add',	(path) =>
		{
			srcCssFiles = findFiles( targetDir , [/\.src\.css$/] );
			css_builder(path , srcCssFiles );
		})
		.on('change',	(path) => {css_builder(path , srcCssFiles )})
		.on('unlink',	(path) =>
		{
			srcCssFiles = findFiles( targetDir , [/\.src\.css$/] );
		});

})()
