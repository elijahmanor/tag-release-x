/* eslint no-console: 0 */

import simpleGitFactory from "simple-git";
import utils from "./utils";
import semver from "semver";
import sequence from "when/sequence";
import sequenceSteps from "./sequence-steps";
import { merge } from "lodash";

function updateVersion( release ) {
	const packageJson = utils.readJSONFile( "./package.json" );
	const oldVersion = packageJson.version;
	const newVersion = packageJson.version = semver.inc( oldVersion, release );

	utils.writeJSONFile( "./package.json", packageJson );

	return { oldVersion, newVersion };
}

export default options => {
	const git = simpleGitFactory( "." );

	console.log( `Tagging a ${ options.release } release ${ options.develop ? "with" : "without" } a develop branch` );

	options = merge( {}, options, { versions: updateVersion( options.release ) } );
	const { versions } = options;
	console.log( `Updated package.json from ${ versions.oldVersion } to ${ versions.newVersion }` );

	sequence( sequenceSteps, [ git, options ] )
		.then( () => console.log( "Finished" ) );
};
