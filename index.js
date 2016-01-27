#!/usr/bin/env node --harmony
/* eslint no-console: 0 */

var commander = require( "commander" );
var inquirer = require( "inquirer" );
var simpleGitFactory = require( "simple-git" );
// var shell = require( "shelljs" );

var quesitons = [
	{
		type: "confirm",
		name: "hasDevelopBranch",
		message: "Do you have a develop branch",
		default: true
	},
	{
		type: "list",
		name: "releaseType",
		message: "What type of release is this",
		choices: [
			{ name: "Major (Breaking Change)", value: "major", short: "l" },
			{ name: "Minor (New Feature)", value: "minor", short: "m" },
			{ name: "Patch (Bug Fix)", value: "patch", short: "s" }
		]
	}
];

/*
remove mrege commits
look for # Next
what changes are included
command line git diff
*/

commander
	.option( "-d, --develop", "Develop branch" )
	.option( "-r, --release [type]", "Release type", /^(major|minor|patch)/i, "patch" );

commander.on( "--help", function() {
	console.log( "Examples: \n" );
	console.log( "   $ tag-release" );
	console.log( "   $ tag-release --develop" );
	console.log( "   $ tag-release -d" );
	console.log( "   $ tag-release --release major" );
	console.log( "   $ tag-release -r minor" );
	console.log( "   $ tag-release -d -r patch" );
} );

commander.parse( process.argv );

console.log( "develop", commander.develop );
console.log( "version", commander.release );

inquirer.prompt( quesitons, function( answers ) {
	console.log( answers );

	var git = simpleGitFactory( "." );

	git.fetch( "upstream", "master", function( error, data ) {
		console.log( "fetch", error, data );
	} ); // git fetch upstream

	// git.checkout( "master", function( error, data ) {
	// 	console.log( "checkout", error, data );
	// } ); // git checkout master
	// git.merge( [ "--ff-only", "upstream" ], function( error, data ) {
	// 	console.log( "merge", error, data );
	// } ); // git merge upstream/master --ff-only
	// if ( answers.hasDevelopBranch ) {
	// 	// git merge upstream/develop #skip if no develop
	// }
	// shell.exec( "git shortlog 1.1.5..", function( code, output ) {
	// 	console.log( code, output );
	// } );
	// // git shortlog 1.1.5.. # update changelog with results
	// // # Update version in changelog and package.json
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
} );
