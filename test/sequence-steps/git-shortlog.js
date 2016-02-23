import test from "ava";
import sinon from "sinon";
import { git } from "../helpers/index.js";

const utils = {
	log: {
		begin: sinon.spy(),
		end: sinon.spy()
	},
	exec: sinon.spy( command => new Promise( resolve => resolve( `1.0
1.1` ) ) ),
	readFile: sinon.stub().returns( `### Next

* one
* two
* three
` ),
	writeFile: sinon.spy()
};
const removeMergeCommits = sinon.spy();

import { gitShortlog, __RewireAPI__ as RewireAPI } from "../../src/sequence-steps";

test.beforeEach( t => {
	utils.exec.reset();
	RewireAPI.__Rewire__( "utils", utils );
	RewireAPI.__Rewire__( "removeMergeCommits", removeMergeCommits );
} );

test.afterEach( t => {
	RewireAPI.__ResetDependency__( "utils" );
	RewireAPI.__ResetDependency__( "removeMergeCommits" );
} );

test( "gitShortlog removes and formats a Next message", t => {
	const options = {};
	gitShortlog( [ git, options ] );
	t.ok( options.shortlog, `* one
* two
* three` );
} );

test.cb( "gitShortlog calls log.begin when no Next", t => {
	utils.readFile = sinon.stub().returns( "" );
	gitShortlog( [ git, {} ] ).then( () => {
		t.ok( utils.log.begin.called );
		t.end();
	} );
} );

test.cb( "gitShortlog gets a list of tag versions when no Next", t => {
	utils.readFile = sinon.stub().returns( "" );
	gitShortlog( [ git, {} ] ).then( () => {
		t.ok( utils.exec.calledWith( "git tag --sort=v:refname" ) );
		t.end();
	} );
} );

test.cb( "gitShortlog gets a shortlog when no Next", t => {
	utils.readFile = sinon.stub().returns( "" );
	gitShortlog( [ git, {} ] ).then( () => {
		t.ok( utils.exec.calledWith( "git --no-pager shortlog 1.1.. < /dev/tty" ) );
		t.end();
	} );
} );

test.cb( "gitShortlog removes merge commits when no Next", t => {
	utils.readFile = sinon.stub().returns( "" );
	gitShortlog( [ git, {} ] ).then( () => {
		t.ok( removeMergeCommits.called );
		t.end();
	} );
} );

test.cb( "gitShortlog calls log.end when no Next", t => {
	utils.readFile = sinon.stub().returns( "" );
	gitShortlog( [ git, {} ] ).then( () => {
		t.ok( utils.log.end.called );
		t.end();
	} );
} );
