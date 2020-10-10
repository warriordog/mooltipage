import test
    from 'ava';
import {
    getTestDataPath
} from '../_util/testFsUtils';
import {
    expandPagePaths,
    readPackageJson
} from '../../bin/cliFs';
import {fixPathSeparators} from '../../lib/fs/pathUtils';


test('expandPagePaths() finds all pages and ignores non-HTML', t => {
    const paths = [ getTestDataPath('testFolder/subFolder')];
    const pages = expandPagePaths(paths, getTestDataPath('testFolder'));
    t.deepEqual(pages, [ fixPathSeparators('subFolder/subPage1.html'), fixPathSeparators('subFolder/subPage2.html')]);
});

test('readPackageJson() extracts data from package.json', t => {
   const packageJson = readPackageJson();

   t.is(packageJson.name, 'mooltipage');
   t.truthy(packageJson.version);
});