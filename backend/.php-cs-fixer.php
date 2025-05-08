<?php

declare(strict_types=1);

use PhpCsFixer\Config;
use PhpCsFixer\Finder;

$finder = Finder::create()
    ->in(__DIR__)
    ->exclude('vendor')
    ->exclude('storage')
    ->name('*.php')
    ->notName('*.blade.php');

return (new Config())
    ->setRules([
        '@PSR12'                       => true,
        'array_syntax'                 => ['syntax' => 'short'],
        'binary_operator_spaces'       => ['default' => 'align_single_space_minimal'],
        'blank_line_after_namespace'   => true,
        'blank_line_after_opening_tag' => true,
        'concat_space'                 => ['spacing' => 'one'],
        'declare_strict_types'         => true,
        'no_unused_imports'            => true,
        'ordered_imports'              => ['sort_algorithm' => 'alpha'],
        'phpdoc_align'                 => ['align' => 'vertical'],
    ])
    ->setFinder($finder);
