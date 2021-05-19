import test
    from 'ava';
import {
    getTestDataPath
} from '../../_util/testFsUtils';
import {
    expandPagePaths,
    readPackageJson
} from '../../../bin/cliFs';
import {fixPathSeparators} from '../../../lib/fs/pathUtils';


test('expandPagePaths() finds all pages and ignores non-HTML', async t => {
    const paths = [ getTestDataPath('testFolder/subFolder')];
    const pages = await expandPagePaths(paths, getTestDataPath('testFolder'));
    t.deepEqual(pages, [ fixPathSeparators('subFolder/subPage1.html'), fixPathSeparators('subFolder/subPage2.html')]);
});

test('readPackageJson() extracts data from package.json', async t => {
   const packageJson = await readPackageJson();

   t.is(packageJson.name, 'mooltipage');
   t.truthy(packageJson.version);
});