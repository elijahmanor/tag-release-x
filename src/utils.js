
import fs from "fs";
import childProcess from "child_process";
import inquirer from "inquirer";
import editor from "editor";

export default {
	readFile( path ) {
		try {
			return fs.readFileSync( path, "utf-8" );
		} catch ( exception ) {
			return "";
		}
	},
	readJSONFile( path ) {
		const content = this.readFile( path );
		return JSON.parse( content );
	},
	writeFile( path, content ) {
		return fs.writeFileSync( path, content, "utf-8" );
	},
	writeJSONFile( path, content ) {
		const NUMBER_OF_SPACES = 4;
		content = `${ JSON.stringify( content, null, NUMBER_OF_SPACES ) }\n`;
		return this.writeFile( path, content );
	},
	promisify( method ) {
		return ( ...args ) =>
			new Promise( ( resolve, reject ) =>
				method( ...args, ( error, data ) => {
					if ( error ) {
						reject( error );
					} else {
						resolve( data );
					}
				} )
		);
	},
	exec( command ) {
		return new Promise( ( resolve, reject ) =>
			childProcess.exec( command, ( error, stdout, stderr ) => {
				if ( error === null ) {
					resolve( stdout );
				} else {
					reject( stderr );
				}
			} )
		);
	},
	prompt( questions ) {
		return new Promise( ( resolve, reject ) =>
			inquirer.prompt( questions, answers => {
				resolve( answers );
			} )
		);
	},
	editor( data ) {
		const tempFilePath = "./.shortlog";

		return new Promise( ( resolve, reject ) => {
			this.writeFile( tempFilePath, data );
			editor( tempFilePath, ( code, sig ) => {
				if ( code === 0 ) {
					resolve( this.readFile( tempFilePath ) );
				} else {
					reject( `Unable to edit ${ tempFilePath }` );
				}
			} );
		} );
	}
};
