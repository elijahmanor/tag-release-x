import test from "ava";
import "babel-core/register";
import utils from "../src/utils";

const TEXT_PATH = "./data/test.md";
const JSON_PATH = "./data/test.json";

test( "readFile should read file contents", t => {
	t.same( utils.readFile( TEXT_PATH ), "a\nb\nc\n" );
} );

test( "readJSONFile should read and parse a .json file", t => {
	const parsedJson = { a: 1, b: 2, c: 3 };
	t.same( utils.readJSONFile( JSON_PATH ), parsedJson );
} );
