import test
    from 'ava';
import {
    fixSep,
    getTestDataPath
} from '../_util/testFsUtils';
import {
    expandPagePaths,
    readPackageJson
} from '../../bin/cliFs';


test('expandPagePaths() finds all pages and ignores non-HTML', t => {
    const paths = [ getTestDataPath('testFolder/subFolder')];
    const pages = expandPagePaths(paths, getTestDataPath('testFolder'));
    t.deepEqual(pages, [ fixSep('subFolder/subPage1.html'), fixSep('subFolder/subPage2.html')]);
});

test('readPackageJson() extracts data from package.json', t => {
   const packageJson = readPackageJson();

   t.is(packageJson.name, 'mooltipage');
   t.truthy(packageJson.version);
});