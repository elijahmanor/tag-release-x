/* eslint no-console: 0 */

import utils from "./utils";
import { findLast } from "lodash";
import { GitHubApi } from "github";
import nodefn from "when/node";

export function gitFetchUpstreamMaster( [ git, options ] ) {
	console.log( "BEGIN git fetch upstream master" );
	return utils.promisify( ::git.fetch )( "upstream", "master" )
		.then( () => console.log( "END git fetch upstream master" ) );
}

export function gitCheckoutMaster( [ git, options ] ) {
	console.log( "BEGIN git checkout master" );
	return utils.promisify( ::git.checkout )( "master" )
		.then( () => console.log( "END git checkout master" ) );
}

export function gitMergeUpstreamMaster( [ git, options ] ) {
	console.log( "BEGIN git merge --ff-only upstream/master" );
	return utils.promisify( ::git.merge )( [ "--ff-only", "upstream/master" ] )
		.then( () => console.log( "END git merge --ff-only upstream/master" ) );
}

export function gitMergeUpstreamDevelop( [ git, options ] ) {
	if ( options.develop ) {
		console.log( "BEGIN git merge upstream/develop" );
		return utils.promisify( ::git.merge )( [ "upstream/develop" ] )
			.then( () => console.log( "END git merge --ff-only upstream/develop" ) );
	}
	console.log( "Skipping git merge --ff-only upstream/develop" );
	return null;
}

export function gitShortlog( [ git, options ] ) {
	return utils.promisify( ::git.tags )().then( tags => {
		const latestRelease = findLast( tags.all, tag => tag !== "" );
		const command = `git --no-pager shortlog ${ latestRelease }.. < /dev/tty`;
		console.log( `BEGIN ${ command }` );
		return utils.exec( command )
			.then( data => {
				console.log( `END ${ command }` );
				options.shortlog = data;
			} );
	} );
}

export function updateShortlog( [ git, options ] ) {
	// TODO: Clean out all the merged entries
	console.log( "Here is a preview of your log", options.shortlog );
	return utils.prompt( [ {
		type: "confirm",
		name: "shortlog",
		message: "Would you like to edit your log",
		default: true
	} ] ).then( answers => {
		if ( answers.shortlog ) {
			return utils.editor( options.shortlog )
				.then( data => options.shortlog = data );
		}
	} );
}

export function updateChangelog( [ git, options ] ) {
	const CHANGELOG_PATH = "./CHANGELOG.md";
	const version = `### ${ options.versions.newVersion }`;
	const update = `${ version }\n\n${ options.shortlog }`;
	let contents = utils.readFile( CHANGELOG_PATH );

	contents = contents.replace( /(## .*\n)/, `$1\n${ update }` );
	utils.writeFile( CHANGELOG_PATH, contents );
}

export function gitDiff( [ git, options ] ) {
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
}

export function gitAdd( [ git, options ] ) {
	console.log( "BEGIN git add CHANGELOG.md package.json" );
	return utils.promisify( ::git.add )( [ "CHANGELOG.md", "package.json" ] )
		.then( () => console.log( "END git add CHANGELOG.md package.json" ) );
}

export function gitCommit( [ git, options ] ) {
	const command = `git commit -m "${ options.versions.newVersion }"`;
	console.log( `BEGIN ${ command }` );
	return utils.promisify( ::git.commit )( options.versions.newVersion )
		.then( () => console.log( `END ${ command }` ) );
}

export function gitTag( [ git, options ] ) {
	const command = `git tag -a v${ options.versions.newVersion } -m "${ options.shortlog }"`;
	console.log( `BEGIN ${ command }` );
	return utils.promisify( ::git.addAnnotatedTag )( `v${ options.versions.newVersion }`, options.shortlog )
		.then( () => console.log( `END ${ command }` ) );
}

export function gitPushUpstreamMaster( [ git, options ] ) {
	const command = "git push upstream master --tags";
	console.log( `BEGIN ${ command }` );
	return utils.exec( command )
		.then( data => {
			console.log( `END ${ command }` );
			return data;
		} );
}

export function npmPublish( [ git, options ] ) {
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
}

export function gitCheckoutDevelop( [ git, options ] ) {
	if ( options.develop ) {
		console.log( "BEGIN git checkout develop" );
		return utils.promisify( ::git.checkout )( "develop" )
			.then( () => console.log( "END git checkout develop" ) );
	}
	console.log( "Skipping git checkout develop" );
	return null;
}

export function gitMergeMaster( [ git, options ] ) {
	if ( options.develop ) {
		console.log( "BEGIN git merge --ff-only master" );
		return utils.promisify( ::git.merge )( [ "--ff-only", "master" ] )
			.then( () => console.log( "END git merge --ff-only master" ) );
	}
	console.log( "Skipping git merge --ff-only master" );
	return null;
}

export function gitPushUpstreamDevelop( [ git, options ] ) {
	if ( options.develop ) {
		console.log( "BEGIN git push upstream develop" );
		return utils.promisify( ::git.push )( "upstream", "develop" )
			.then( () => console.log( "END git push upstream develop" ) );
	}
	console.log( "Skipping git push upstream develop" );
	return null;
}

export function markTagAsRelease( [ git, options ] ) {
	console.log( "BEGIN mark tag as release" );
	const github = new GitHubApi( {
		version: "3.0.0",
		debug: true,
		protocol: "https",
		host: "api.github.com",
		timeout: 5000
	} );
	github.authenticate( {
		type: "basic",
		username: "elijahmanor",
		password: "dog$not"
	} );
	const createRelease = nodefn.lift( github.releases.createRelease );
	return createRelease( {
		owner: "elijahmanor",
		repo: "tag-release",
		target_commitish: "master", // eslint-disable-line camelcase
		tag_name: options.release.newVersion, // eslint-disable-line camelcase
		name: options.release.newVersion,
		body: options.shortlog
	}, err => {
		console.log( "END mark tag as release" );
	} );
}

export default [
	gitFetchUpstreamMaster,
	gitCheckoutMaster,
	gitMergeUpstreamMaster,
	gitMergeUpstreamDevelop,
	gitShortlog,
	updateShortlog,
	updateChangelog,
	gitDiff,
	gitAdd,
	gitCommit,
	gitTag,
	gitPushUpstreamMaster,
	npmPublish,
	gitCheckoutDevelop,
	gitMergeMaster,
	gitPushUpstreamDevelop,
	markTagAsRelease
];
