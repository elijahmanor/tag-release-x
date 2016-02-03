/* eslint no-console: 0 */

import utils from "./utils";
import { findLast } from "lodash";
import { GitHubApi } from "github4";
import nodefn from "when/node";

const sequenceSteps = [
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
	// markTagAsRelease,
	gitPushOriginMaster
];

export function gitFetchUpstreamMaster( [ git, options ] ) {
	const command = "git fetch upstream master";
	utils.log.begin( command );
	return utils.promisify( ::git.fetch )( "upstream", "master" )
		.then( () => utils.log.end() );
}

export function gitCheckoutMaster( [ git, options ] ) {
	const command = "git checkout master";
	utils.log.begin( command );
	return utils.promisify( ::git.checkout )( "master" )
		.then( () => utils.log.end() );
}

export function gitMergeUpstreamMaster( [ git, options ] ) {
	const command = "git merge --ff-only upstream/master";
	utils.log.begin( command );
	return utils.promisify( ::git.merge )( [ "--ff-only", "upstream/master" ] )
		.then( () => utils.log.end() );
}

export function gitMergeUpstreamDevelop( [ git, options ] ) {
	const command = "git merge upstream/develop";
	utils.log.begin( command );
	if ( options.develop ) {
		return utils.promisify( ::git.merge )( [ "upstream/develop" ] )
			.then( () => utils.log.end() );
	}
	utils.log.end();
	return null;
}

export function gitShortlog( [ git, options ] ) {
	return utils.promisify( ::git.tags )().then( tags => {
		const latestRelease = findLast( tags.all, tag => tag !== "" );
		const command = `git --no-pager shortlog ${ latestRelease }.. < /dev/tty`;
		utils.log.begin( command );
		return utils.exec( command )
			.then( data => {
				options.shortlog = data;
				utils.log.end();
			} );
	} );
}

export function updateShortlog( [ git, options ] ) {
	// TODO: Clean out all the merged entries
	const command = "shortlog preview";
	console.log( "Here is a preview of your log", options.shortlog );
	utils.log.begin( command );
	return utils.prompt( [ {
		type: "confirm",
		name: "shortlog",
		message: "Would you like to edit your log",
		default: true
	} ] ).then( answers => {
		if ( answers.shortlog ) {
			return utils.editor( options.shortlog )
				.then( data => {
					options.shortlog = data;
					utils.log.end();
				} );
		}
	} );
}

export function updateChangelog( [ git, options ] ) {
	const CHANGELOG_PATH = "./CHANGELOG.md";
	const version = `### ${ options.versions.newVersion }`;
	const update = `${ version }\n\n${ options.shortlog }`;

	const command = "update changelog";
	utils.log.begin( command );
	let contents = utils.readFile( CHANGELOG_PATH );

	contents = contents.replace( /(## .*\n)/, `$1\n${ update }` );
	utils.writeFile( CHANGELOG_PATH, contents );
	utils.log.end();
}

export function gitDiff( [ git, options ] ) {
	const command = "git diff --color CHANGELOG.md package.json";
	return utils.exec( command )
		.then( data => {
			console.log( data );
			utils.log.begin( command );
			return utils.prompt( [ {
				type: "confirm",
				name: "proceed",
				message: "Are you okay with this diff",
				default: true
			} ] ).then( answers => {
				utils.log.end();
				if ( !answers.proceed ) {
					process.exit( 0 ); // eslint-disable-line no-process-exit
				}
			} );
		} );
}

export function gitAdd( [ git, options ] ) {
	const command = "git add CHANGELOG.md package.json";
	utils.log.begin( command );
	return utils.promisify( ::git.add )( [ "CHANGELOG.md", "package.json" ] )
		.then( () => utils.log.end() );
}

export function gitCommit( [ git, options ] ) {
	const command = `git commit -m "${ options.versions.newVersion }"`;
	utils.log.begin( command );
	return utils.promisify( ::git.commit )( options.versions.newVersion )
		.then( () => utils.log.end() );
}

export function gitTag( [ git, options ] ) {
	const command = `git tag -a v${ options.versions.newVersion } -m "..."`;
	utils.log.begin( command );
	return utils.promisify( ::git.addAnnotatedTag )( `v${ options.versions.newVersion }`, options.shortlog )
		.then( () => utils.log.end() );
}

export function gitPushUpstreamMaster( [ git, options ] ) {
	const command = "git push upstream master --tags";
	utils.log.begin( command );
	return utils.exec( command )
		.then( data => {
			utils.log.end();
			return data;
		} );
}

export function npmPublish( [ git, options ] ) {
	const command = `npm publish`;
	utils.log.begin( command );
	return utils.prompt( [ {
		type: "confirm",
		name: "publish",
		message: "Do you want to publish this package",
		default: true
	} ] ).then( answers => {
		if ( answers.publish ) {
			return utils.exec( command )
				.then( data => {
					utils.log.end();
				} );
		}
		utils.log.end();
	} );
}

export function gitCheckoutDevelop( [ git, options ] ) {
	const command = `git checkout develop`;
	utils.log.begin( command );
	if ( options.develop ) {
		return utils.promisify( ::git.checkout )( "develop" )
			.then( () => utils.log.end() );
	}
	utils.log.end();
	return null;
}

export function gitMergeMaster( [ git, options ] ) {
	const command = `git merge --ff-only master`;
	utils.log.begin( command );
	if ( options.develop ) {
		return utils.promisify( ::git.merge )( [ "--ff-only", "master" ] )
			.then( () => utils.log.end() );
	}
	utils.log.end();
	return null;
}

export function gitPushUpstreamDevelop( [ git, options ] ) {
	const command = `git push upstream develop`;
	utils.log.begin( command );
	if ( options.develop ) {
		return utils.promisify( ::git.push )( "upstream", "develop" )
			.then( () => utils.log.end() );
	}
	utils.log.end();
	return null;
}

export function markTagAsRelease( [ git, options ] ) {
	const command = `github create release`;
	utils.log.begin( command );
	// console.log( "BEGIN mark tag as release" );
	const github = new GitHubApi( {
		version: "3.0.0",
		debug: true,
		protocol: "https",
		host: "api.github.com",
		timeout: 5000
	} );
	// console.log( "1" );
	github.authenticate( {
		type: "basic",
		username: "elijahmanor",
		password: "dog$not"
	} );
	// console.log( "2" );
	const createRelease = nodefn.lift( github.releases.createRelease );
	// console.log( "3", createRelease );
	return createRelease( {
		owner: "elijahmanor",
		repo: "tag-release",
		target_commitish: "master", // eslint-disable-line camelcase
		tag_name: options.release.newVersion, // eslint-disable-line camelcase
		name: options.release.newVersion,
		body: options.shortlog
	}, err => {
		// console.log( "END mark tag as release" );
		utils.log.end();
	} );
}

export function gitPushOriginMaster( [ git, options ] ) {
	const command = `git push upstream master`;
	utils.log.begin( command );
	return utils.promisify( ::git.push )( "origin", "master" )
		.then( () => utils.log.end() );
}

export default sequenceSteps;
