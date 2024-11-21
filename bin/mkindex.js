const fs = require('fs');
const path = require('path');

// 指定されたディレクトリから再帰的に HTML ファイルと markdown ファイルを収集
function getHtmlFiles(dir, fileList = [],ignore_regex = [])
{
	const files = fs.readdirSync(dir);
	files.forEach((file) =>
	{
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory())
		{
			getHtmlFiles(filePath, fileList , ignore_regex);
		}
		else
		{
			if( ignore_regex.length > 0 )
			{
				for( const regex of ignore_regex )
				{
					if( regex.test( filePath ) )
					{
						return;
					}
				}
			}

			if (path.extname(file) === '.html')
			{
				if( path.relative(dir, filePath) !== 'index.html' )
				{
					fileList.push({
						path: filePath,
						title: getTitleFromHTML( filePath )
					});
				}
			}
			else if( path.extname(file) === '.md' )
			{
				const title = getTitleFromMarkdown( filePath )
				const basename = path.basename( filePath ,'.md' );
				const path_dir = path.dirname( filePath );
				const html_path = path.join( path_dir , basename + '.html' );

				fileList.push({
					path: html_path,
					title: title
				});
			}
		}
	});
	return fileList;
}

// ディレクトリの深さと文字列の昇順でソート
function sortHtmlFilesByDepthAndName(fileList)
{
	return fileList.sort((a, b) =>
	{
		const depthA = a.path.split(path.sep).length;
		const depthB = b.path.split(path.sep).length;

		if (depthA !== depthB)
		{
			return depthA - depthB;  // 深さが浅い順にソート
		}
		else
		{
			return a.path.localeCompare(b.path);  // 文字列の昇順でソート
		}
	});
}

function getTitleFromHTML( file_path )
{
	const content = fs.readFileSync( file_path ,'utf-8');

	if( typeof content === 'string' )
	{
		const matched = content.match( /<title>([^<]+)<\//im );

		if( matched )
		{
			return matched[1];
		}
	}
	
	return undefined;
}

/**
 * 一番最初の # のついていない行、または最初の単独の # で始まる行をタイトルとして抽出する
 * @param {string} file_path 
 */
function getTitleFromMarkdown( file_path )
{
	const content = fs.readFileSync( file_path ,'utf-8');
	
	let tilte = ""
	const regex = /^#\s+(.+)/;
	const normal_line_regex = /^[^#\*\s\-\+\=].+/;
	for( let line of content.split(/\r?\n/) )
	{
		if( line.length > 0 )
		{
			const match = regex.exec( line );
			if( match )
			{
				return match[1];
			}
			else
			{
				if( normal_line_regex.exec( line ) )
				{
					return line;
				}
			}
		}
	}

	return undefined;
}

// HTML ファイルへのリンクをまとめた index.html を生成
function generateIndexHtml(dir, outputFile = 'index.html') {
  const htmlFiles = getHtmlFiles(dir ,[] , [/_[^\/]+$/]);
  const sortedHtmlFiles = sortHtmlFilesByDepthAndName(htmlFiles);

  const links = sortedHtmlFiles.map( ( rec ) =>
  	{
		const file = rec.path;
		let page_title = rec.title;
		const relativePath = path.relative(dir, file);
		if( ! page_title )
		{
			page_title = '';
		}
		else
		{
			page_title = ` - ${page_title}`
		}
		return `<li><a href="${relativePath}">${relativePath}</a>${page_title}</li>`;
  	}).join('\n');

  const content = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="../global.css" rel="stylesheet">
  <title>Index of HTML Files</title>
</head>
<body class="p-6">
  <h1 class="mb-6">Index of HTML Files</h1>
  <ul>
    ${links}
  </ul>
</body>
</html>
`;

  fs.writeFileSync(path.join(dir, outputFile), content);
  console.log(`${outputFile} has been generated in ${dir}`);
}


const targetDir = process.argv[2] || 'docs';

try
{
	fs.statSync( targetDir ).isDirectory();
}
catch( e )
{
	console.error( "The target directory must be specified."　);
	process.exit(1);
}

generateIndexHtml(targetDir ,'index.html');