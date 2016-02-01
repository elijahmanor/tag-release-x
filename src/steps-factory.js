/* eslint no-console: 0 */

import utils from "./utils";

export default ( git, options ) => [
	() => {
		console.log( "BEGIN git.fetch upstream master" );
		return utils.promisify( ::git.fetch )( "upstream", "master" )
			.then( () => console.log( "END git.fetch upstream master" ) );
	},
	() => {
		console.log( "BEGIN git.checkout master" );
		return utils.promisify( ::git.checkout )( "master" )
			.then( () => console.log( "END git.checkout master" ) );
	},
	() => {
		console.log( "BEGIN git.merge --ff-only upstream/master" );
		return utils.promisify( ::git.merge )( [ "--ff-only", "upstream/master" ] )
			.then( () => console.log( "END git.merge --ff-only upstream/master" ) );
	},
	() => {
		if ( options.develop ) {
			console.log( "BEGIN git.merge --ff-only upstream/develop" );
			return utils.promisify( ::git.merge )( [ "--ff-only", "upstream/develop" ] )
				.then( () => console.log( "END git.merge --ff-only upstream/develop" ) );
		}

		console.log( "Skipping git.merge --ff-only upstream/develop" );
		return null;
	},
	() => {
		const command = `git --no-pager shortlog ${ options.versions.oldVersion }.. < /dev/tty`;
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
		let contents = utils.readFile( CHANGELOG_PATH );

		contents = `${ version }\n\n${ data }\n${ contents }`;

		utils.writeFile( CHANGELOG_PATH, contents );
	}
];

// git.add( [ "CHANGELOG", "package.json" ], function( error, data ) {
// 	console.log( "add", error, data );
// } ); // git add package.json CHANGELOG.md
// git.commit( "1.2.0", function( error, data ) {
// 	console.log( "commit", error, data );
// } ); // git commit -m "1.2.0"
// git.addAnnotatedTag( "v1.2.0", "...contents of changelog for this version...", function( error, data ) {
// 	console.log( "addTag", error, data );
// } ); // git tag -a v1.2.0 -m ""
// git.pushTags( "upstream master", function( error, data ) {
// 	console.log( "pushTags", error, data );
// } ); // git push upstream master --tags
// npm publish
// git checkout develop #skip step 8 if no develop
// git merge master --ff-only
// git push upstream develop
// # Mark tag as a release in Github
// # Add the version to the cards (as a tag) in LeanKit that were git tagged.

/*
remove mrege commits
look for # Next
what changes are included
command line git diff
*/
