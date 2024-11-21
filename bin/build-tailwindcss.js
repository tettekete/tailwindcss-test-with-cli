// const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { execFile } = require('child_process');

function buildWithTailwindcss( file_path )
{
	const dest_file = file_path.replace( /\.src\.css$/i ,'.css' );

	if( dest_file === file_path )
	{
		return false;
	}

	console.log(`build: "${file_path}"`);
	
	execFile('npx',
		[
			'tailwindcss',
			'-i',
			file_path,
			'-o',
			dest_file
		],
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

const targetDir = process.argv[2] || 'docs';

const watcher = chokidar.watch(
	targetDir,
	{
		ignored: (path, stats) => stats?.isFile() && !path.endsWith('.src.css'),
		persistent: true
	});

watcher
  .on('add',	(path) => {buildWithTailwindcss(path)})
  .on('change',	(path) => {buildWithTailwindcss(path)});
