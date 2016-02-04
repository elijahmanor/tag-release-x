import test from "ava";
import "babel-core/register";
import { gitFetchUpstreamMaster } from "../src/sequence-steps";

const git = {
	fetch() {
		return new Promise();
	}
};
const options = {};

test( "gitFetchUpstreamMaster returns a promise", t => {
	console.log( gitFetchUpstreamMaster, git, options );
	const promise = gitFetchUpstreamMaster( [ git, options ] );
	console.log( "promise", promise );
	t.ok( promise instanceof Promise );
} );
