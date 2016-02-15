/* eslint no-console: 0 */

import utils from "./utils";
import { GitHubApi } from "github4";
import nodefn from "when/node";
import semver from "semver";

const CHANGELOG_PATH = "./CHANGELOG.md";
const sequenceSteps = [
	gitFetchUpstreamMaster,
	gitCheckoutMaster,
	gitMergeUpstreamMaster,
	gitMergeUpstreamDevelop,
	updateVersion,
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
	const command = "git fetch upstream master --tags";
	utils.log.begin( command );
	return utils.exec( command ).then( () => utils.log.end() );
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
	if ( options.develop ) {
		utils.log.begin( command );
		return utils.promisify( ::git.merge )( [ "upstream/develop" ] )
			.then( () => utils.log.end() );
	}
	return null;
}

export function updateVersion( [ git, options ] ) {
	const packageJson = utils.readJSONFile( "./package.json" );
	const oldVersion = packageJson.version;
	const newVersion = packageJson.version = semver.inc( oldVersion, options.release );
	utils.writeJSONFile( "./package.json", packageJson );
	options.versions = { oldVersion, newVersion };
	console.log( `Updated package.json from ${ oldVersion } to ${ newVersion }` );
}

export function gitShortlog( [ git, options ] ) {
	let contents = utils.readFile( CHANGELOG_PATH );

	if ( ~contents.indexOf( "### Next" ) ) {
		contents = contents.replace( /### Next([^#]+)/, ( match, submatch ) => {
			options.shortlog = submatch.trim();
			return "";
		} );
		utils.writeFile( CHANGELOG_PATH, contents );
	} else {
		return utils.exec( "git tag --sort=v:refname" ).then( tags => {
			tags = tags.trim().split( "\n" );
			const latestRelease = tags[ tags.length - 1 ];
			const command = `git --no-pager shortlog ${ latestRelease }.. < /dev/tty`;
			utils.log.begin( command );
			return utils.exec( command )
				.then( data => {
					options.shortlog = data;
					utils.log.end();
				} );
		} );
	}
}

export function updateShortlog( [ git, options ] ) {
	// TODO: Clean out all the merged entries
	const command = "shortlog preview";
	console.log( "Here is a preview of your log: \n", options.shortlog );
	return utils.prompt( [ {
		type: "confirm",
		name: "shortlog",
		message: "Would you like to edit your log",
		default: true
	} ] ).then( answers => {
		utils.log.begin( command );
		if ( answers.shortlog ) {
			return utils.editor( options.shortlog )
				.then( data => {
					options.shortlog = data.trim();
					utils.log.end();
				} );
		}
	} );
}

export function updateChangelog( [ git, options ] ) {
	const version = `### ${ options.versions.newVersion }`;
	const update = `${ version }\n\n${ options.shortlog }`;

	const command = "update changelog";
	utils.log.begin( command );
	let contents = utils.readFile( CHANGELOG_PATH );

	contents = contents.replace( /(## .*\n)/, `$1\n${ update }\n` );
	utils.writeFile( CHANGELOG_PATH, contents );
	utils.log.end();
}

export function gitDiff( [ git, options ] ) {
	const command = "git diff --color CHANGELOG.md package.json";
	return utils.exec( command )
		.then( data => {
			console.log( data );
			return utils.prompt( [ {
				type: "confirm",
				name: "proceed",
				message: "Are you okay with this diff",
				default: true
			} ] ).then( answers => {
				utils.log.begin( command );
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
		.then( data => utils.log.end() );
}

export function npmPublish( [ git, options ] ) {
	const command = `npm publish`;
	return utils.prompt( [ {
		type: "confirm",
		name: "publish",
		message: "Do you want to publish this package",
		default: true
	} ] ).then( answers => {
		utils.log.begin( command );
		if ( answers.publish ) {
			return utils.exec( command ).then( data => utils.log.end() );
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
	if ( options.develop ) {
		utils.log.begin( command );
		return utils.promisify( ::git.merge )( [ "--ff-only", "master" ] )
			.then( () => utils.log.end() );
	}
	return null;
}

export function gitPushUpstreamDevelop( [ git, options ] ) {
	const command = `git push upstream develop`;
	if ( options.develop ) {
		utils.log.begin( command );
		return utils.promisify( ::git.push )( "upstream", "develop" )
			.then( () => utils.log.end() );
	}
	return null;
}

export function markTagAsRelease( [ git, options ] ) {
	const command = `github create release`;
	utils.log.begin( command );
	console.log( "BEGIN mark tag as release" );
	const github = new GitHubApi( {
		version: "3.0.0",
		debug: true,
		protocol: "https",
		host: "api.github.com",
		timeout: 5000,
		headers: {
			"user-agent": "elijahmanor/tag-release"
		}
	} );
	console.log( "1" );
	return utils.prompt( [ {
		type: "input",
		name: "username",
		message: "GitHub username"
	}, {
		type: "password",
		name: "password",
		message: "GitHub password"
	} ] ).then( answers => {
		console.log( "2" );
		github.authenticate( {
			type: "basic",
			username: answers.username,
			password: answers.password
		} );
		console.log( "3" );
		const createRelease = nodefn.lift( github.releases.createRelease );
		console.log( "4", createRelease );
		return createRelease( {
			owner: "elijahmanor",
			repo: "tag-release",
			target_commitish: "master", // eslint-disable-line camelcase
			tag_name: options.release.newVersion, // eslint-disable-line camelcase
			name: options.release.newVersion,
			body: options.shortlog
		}, err => {
			utils.log.end();
		} );
	} );
}

export function gitPushOriginMaster( [ git, options ] ) {
	const command = `git push upstream master`;
	utils.log.begin( command );
	return utils.promisify( ::git.push )( "origin", "master" )
		.then( () => utils.log.end() );
}

export default sequenceSteps;
