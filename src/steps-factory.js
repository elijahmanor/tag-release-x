/* eslint no-console: 0 */

import utils from "./utils";

export default ( git, options ) => [
	() => {
		console.log( "BEGIN git fetch upstream master" );
		return utils.promisify( ::git.fetch )( "upstream", "master" )
			.then( () => console.log( "END git fetch upstream master" ) );
	},
	() => {
		console.log( "BEGIN git checkout master" );
		return utils.promisify( ::git.checkout )( "master" )
			.then( () => console.log( "END git checkout master" ) );
	},
	() => {
		console.log( "BEGIN git merge --ff-only upstream/master" );
		return utils.promisify( ::git.merge )( [ "--ff-only", "upstream/master" ] )
			.then( () => console.log( "END git merge --ff-only upstream/master" ) );
	},
	() => {
		if ( options.develop ) {
			console.log( "BEGIN git merge upstream/develop" );
			return utils.promisify( ::git.merge )( [ "upstream/develop" ] )
				.then( () => console.log( "END git merge --ff-only upstream/develop" ) );
		}
		console.log( "Skipping git merge --ff-only upstream/develop" );
		return null;
	},
	() => {
		const command = `git --no-pager shortlog v${ options.versions.oldVersion }.. < /dev/tty`;
		console.log( `BEGIN ${ command }` );
		return utils.exec( command )
			.then( data => {
				console.log( `END ${ command }` );
				return data;
			} );
	},
	data => {
		// TODO: Clean out all the merged entries
		console.log( "Here is a preview of your log", data );
		return utils.prompt( [ {
			type: "confirm",
			name: "shortlog",
			message: "Would you like to edit your log",
			default: true
		} ] ).then( answers => {
			if ( answers.shortlog ) {
				return utils.editor( data );
			}
			return data;
		} );
	},
	data => { // update CHANGELOG
		const CHANGELOG_PATH = "./CHANGELOG.md";
		const version = `### ${ options.versions.newVersion }`;
		const update = `${ version }\n\n${ data }`;
		let contents = utils.readFile( CHANGELOG_PATH );

		options.shortlog = data;
		contents = contents.replace( /(## .*\n)/, `$1\n${ update }` );
		utils.writeFile( CHANGELOG_PATH, contents );
	},
	() => {
		console.log( "BEGIN git diff" );
		return utils.promisify( ::git.diff )()
			.then( data => {
				console.log( "END git diff", data );
				return utils.prompt( [ {
					type: "confirm",
					name: "proceed",
					message: "Are you okay with this diff",
					default: true
				} ] ).then( answers => {
					if ( answers.proceed ) {
						return true;
					}
					process.exit( 0 ); // eslint-disable-line no-process-exit
				} );
			} );
	},

	() => {
		console.log( "BEGIN git add CHANGELOG.md package.json" );
		return utils.promisify( ::git.add )( [ "CHANGELOG.md", "package.json" ] )
			.then( () => console.log( "END git add CHANGELOG.md package.json" ) );
	},
	() => {
		const command = `git commit -m "${ options.versions.newVersion }"`;
		console.log( `BEGIN ${ command }` );
		return utils.promisify( ::git.commit )( options.versions.newVersion )
			.then( () => console.log( `END ${ command }` ) );
	},
	() => {
		const command = `git tag -a v${ options.versions.newVersion } -m "${ options.shortlog }"`;
		console.log( `BEGIN ${ command }` );
		return utils.promisify( ::git.addAnnotatedTag )( `v${ options.versions.newVersion }`, options.shortlog )
			.then( () => console.log( `END ${ command }` ) );
	},
	() => {
		const command = "git push upstream master --tags";
		console.log( `BEGIN ${ command }` );
		return utils.exec( command )
			.then( data => {
				console.log( `END ${ command }` );
				return data;
			} );
	},
	() => {
		const command = `npm publish`;
		console.log( `BEGIN ${ command }` );
		return utils.prompt( [ {
			type: "confirm",
			name: "publish",
			message: "Do you want to publish this package",
			default: true
		} ] ).then( answers => {
			if ( answers.publish ) {
				return utils.exec( command )
					.then( data => console.log( `END ${ command }` ) );
			}
			return true;
		} );
	},
	() => {
		if ( options.develop ) {
			console.log( "BEGIN git checkout develop" );
			return utils.promisify( ::git.checkout )( "develop" )
				.then( () => console.log( "END git checkout develop" ) );
		}
		console.log( "Skipping git checkout develop" );
		return null;
	},
	() => {
		if ( options.develop ) {
			console.log( "BEGIN git merge --ff-only master" );
			return utils.promisify( ::git.merge )( [ "--ff-only", "master" ] )
				.then( () => console.log( "END git merge --ff-only master" ) );
		}
		console.log( "Skipping git merge --ff-only master" );
		return null;
	},
	() => {
		if ( options.develop ) {
			console.log( "BEGIN git push upstream develop" );
			return utils.promisify( ::git.push )( "upstream", "develop" )
				.then( () => console.log( "END git push upstream develop" ) );
		}
		console.log( "Skipping git push upstream develop" );
		return null;
	},
	() => {
		// # Mark tag as a release in Github
		// # Add the version to the cards (as a tag) in LeanKit that were git tagged.
	}
];
