import test from 'ava';
import {PipelineIOImpl} from '../../../lib/pipeline/standardPipeline';
import {fixPathSeparators} from '../../../lib/fs/pathUtils';

test('PipelineIOImpl.getSourceResPathForAbsolutePath() resolves to source directory', t => {
    const pio = new PipelineIOImpl(fixPathSeparators('some/source/directory'), fixPathSeparators('some/dest/directory'));

    t.is(pio.getSourceResPathForAbsolutePath(fixPathSeparators('some/source/directory/some/file.html')), fixPathSeparators('some/file.html'));
});

test('PipelineIOImpl.getSourceResPathForAbsolutePath() handles empty string source', t => {
    const pio = new PipelineIOImpl('', '');

    t.is(pio.getSourceResPathForAbsolutePath(fixPathSeparators('some/file.html')), fixPathSeparators('some/file.html'));
});

test('PipelineIOImpl.getDestinationResPathForAbsolutePath() resolves to destination directory', t => {
    const pio = new PipelineIOImpl(fixPathSeparators('some/source/directory'), fixPathSeparators('some/dest/directory'));

    t.is(pio.getDestinationResPathForAbsolutePath(fixPathSeparators('some/dest/directory/some/file.html')), fixPathSeparators('some/file.html'));
});

test('PipelineIOImpl.getDestinationResPathForAbsolutePath() handles empty string destination', t => {
    const pio = new PipelineIOImpl('', '');

    t.is(pio.getDestinationResPathForAbsolutePath(fixPathSeparators('some/file.html')), fixPathSeparators('some/file.html'));
});
