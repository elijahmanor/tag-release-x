import test from "ava";
import { removeMergeCommits } from "../../src/sequence-steps";

const SHORTLOG_WITH_MERGES = `Elijah Manor (4):
	 Add DropdownButton and MenuItem components
	 Add unit tests for DropdownMenu and MenuItem components
	 Fix IE11 Dropdown Button menu collapse bug
	 Fix IE9 Bug with Dropdown Button that prevented close of menu

Genela Hardin (2):
	 Merge pull request #138 from BanditSoftware/feature-dropdownbutton
	 Merge pull request #139 from BanditSoftware/fix-dropdownbutton-ie11

Jim Cowart (1):
	 Merge pull request #135 from elijahmanor/feature-dropdownbutton

Matt Dunlap (2):
	 Merge pull request #136 from elijahmanor/fix-dropdownbutton-ie11
	 Merge pull request #137 from elijahmanor/fix-dropdownbutton-ie11
`;

const SHORTLOG_WITHOUT_MERGES = `Elijah Manor (4):
	 Add DropdownButton and MenuItem components
	 Add unit tests for DropdownMenu and MenuItem components
	 Fix IE11 Dropdown Button menu collapse bug
	 Fix IE9 Bug with Dropdown Button that prevented close of menu

Genela Hardin (2):

Jim Cowart (1):

Matt Dunlap (2):
`;

test.only( "remove merge commits from shortlog", t => {
	t.is( removeMergeCommits( SHORTLOG_WITH_MERGES ), SHORTLOG_WITHOUT_MERGES );
} );
