const fs = require('fs');
const path = require('path');

// 指定されたディレクトリから再帰的に HTML ファイルを収集
function getHtmlFiles(dir, fileList = [])
{
	const files = fs.readdirSync(dir);
	files.forEach((file) =>
	{
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory())
		{
			getHtmlFiles(filePath, fileList);
		}
		else if (path.extname(file) === '.html')
		{
			if( path.relative(dir, filePath) !== 'index.html' )
			{
				fileList.push(filePath);
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
		const depthA = a.split(path.sep).length;
		const depthB = b.split(path.sep).length;

		if (depthA !== depthB)
		{
			return depthA - depthB;  // 深さが浅い順にソート
		}
		else
		{
			return a.localeCompare(b);  // 文字列の昇順でソート
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

// HTML ファイルへのリンクをまとめた index.html を生成
function generateIndexHtml(dir, outputFile = 'index.html') {
  const htmlFiles = getHtmlFiles(dir);
  const sortedHtmlFiles = sortHtmlFilesByDepthAndName(htmlFiles);

  const links = sortedHtmlFiles.map( ( file ) =>
  	{
		let page_title = getTitleFromHTML( file );
		const relativePath = path.relative(dir, file);
		if( ! page_title )
		{
			page_title = relativePath;
		}
		else
		{
			page_title = `${relativePath} - ${page_title}`
		}
		return `<li><a href="${relativePath}">${page_title}</a></li>`;
  	}).join('\n');

  const content = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Index of HTML Files</title>
</head>
<body>
  <h1>Index of HTML Files</h1>
  <ul>
    ${links}
  </ul>
</body>
</html>
`;

  fs.writeFileSync(path.join(dir, outputFile), content);
  console.log(`${outputFile} has been generated in ${dir}`);
}


const targetDir = process.argv[2] || '';

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