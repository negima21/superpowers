# markdownlint Complete Rules Reference (MD001 – MD060)

Based on official [DavidAnson/markdownlint](https://github.com/DavidAnson/markdownlint) specification (v0.41+).

| Rule | Alias / Name | Tags | Fixable? | Default | Key Parameters & Description |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **MD001** | `heading-increment` | `headings` | No | Enabled | Heading levels should only increment by one level at a time (e.g. h1 $\rightarrow$ h2, not h1 $\rightarrow$ h3). |
| **MD002** | `first-heading-h1` | `headings` | No | Disabled | First heading should be a top-level heading (`level`: 1). |
| **MD003** | `heading-style` | `headings` | No | Enabled | Heading style (`style`: `consistent`, `atx`, `atx_closed`, `setext`, `setext_with_atx`, `setext_with_atx_closed`). Prefer `atx`. |
| **MD004** | `ul-style` | `bullet`, `ul` | **Yes** | Enabled | Unordered list style (`style`: `consistent`, `asterisk`, `plus`, `dash`, `sublist`). Prefer `dash` (`-`). |
| **MD005** | `list-indent` | `bullet`, `ul`, `indentation` | **Yes** | Enabled | Inconsistent indentation for list items at the same level. |
| **MD007** | `ul-indent` | `bullet`, `ul`, `indentation` | **Yes** | Enabled | Unordered list indentation (`indent`: number of spaces, default 2). |
| **MD009** | `no-trailing-spaces` | `whitespace` | **Yes** | Enabled | Trailing spaces disallowed except exactly 2 spaces for hard line breaks (`br_spaces`: 2, `strict`: false). |
| **MD010** | `no-hard-tabs` | `whitespace`, `hard_tab` | **Yes** | Enabled | Hard tab characters disallowed; use soft spaces (`code_blocks`: true, `spaces_per_tab`: 1). |
| **MD011** | `no-reversed-links` | `links` | **Yes** | Enabled | Reversed link syntax detected (e.g. `(text)[url]` instead of `[text](url)`). |
| **MD012** | `no-multiple-blanks` | `whitespace`, `blank_lines` | **Yes** | Enabled | Multiple consecutive blank lines disallowed (`maximum`: 1). |
| **MD013** | `line-length` | `line_length` | No | **Disabled** | Line length limit (`line_length`: 80, `code_blocks`: false, `tables`: false, `headings`: false). Typically disabled for prose docs. |
| **MD014** | `commands-show-output` | `code` | **Yes** | Enabled | Dollar signs used before shell commands without showing output (`$ cmd`). |
| **MD018** | `no-missing-space-atx` | `headings`, `atx`, `spaces` | **Yes** | Enabled | Missing space after hash on atx style heading (e.g. `#Heading` $\rightarrow$ `# Heading`). |
| **MD019** | `no-multiple-space-atx` | `headings`, `atx`, `spaces` | **Yes** | Enabled | Multiple spaces after hash on atx style heading (e.g. `#   Heading`). |
| **MD020** | `no-missing-space-closed-atx` | `headings`, `atx_closed`, `spaces` | **Yes** | Enabled | Missing space inside hashes on closed atx heading (`#Heading#`). |
| **MD021** | `no-multiple-space-closed-atx` | `headings`, `atx_closed`, `spaces` | **Yes** | Enabled | Multiple spaces inside hashes on closed atx heading. |
| **MD022** | `blanks-around-headings` | `headings`, `blank_lines` | **Yes** | Enabled | Headings must be surrounded by blank lines (`lines_above`: 1, `lines_below`: 1). |
| **MD023** | `heading-start-left` | `headings`, `spaces` | **Yes** | Enabled | Headings must start at the beginning of the line (column 1). |
| **MD024** | `no-duplicate-heading` | `headings` | No | Enabled | Multiple headings with identical text (`siblings_only`: true). Set `siblings_only: true` for modular docs. |
| **MD025** | `single-title` / `single-h1` | `headings` | No | Enabled | Multiple top-level headings in same document (`level`: 1, `front_matter_title`: `""`). |
| **MD026** | `no-trailing-punctuation` | `headings` | **Yes** | Enabled | Trailing punctuation in heading (`punctuation`: `.,;:!?。，；：！？`). |
| **MD027** | `no-multiple-space-blockquote` | `blockquote`, `whitespace`, `indentation` | **Yes** | Enabled | Multiple spaces after blockquote symbol (`>   text`). |
| **MD028** | `no-blanks-blockquote` | `blockquote`, `whitespace` | No | Enabled | Blank line inside blockquote without quote marker. |
| **MD029** | `ol-prefix` | `ol` | No | Enabled | Ordered list item prefix (`style`: `one`, `ordered`, `one_or_ordered`, `zero`). |
| **MD030** | `list-marker-space` | `ol`, `ul`, `whitespace` | **Yes** | Enabled | Spaces after list markers (`ul_single`: 1, `ol_single`: 1). |
| **MD031** | `blanks-around-fences` | `code`, `blank_lines` | **Yes** | Enabled | Fenced code blocks must be surrounded by blank lines (`list_items`: true). |
| **MD032** | `blanks-around-lists` | `bullet`, `ul`, `ol`, `blank_lines` | **Yes** | Enabled | Lists must be surrounded by blank lines before first item and after last item. |
| **MD033** | `no-inline-html` | `html` | No | Enabled | Inline HTML disallowed (`allowed_elements`: `["br", "details", "summary", "img", "kbd", "sub", "sup"]`). |
| **MD034** | `no-bare-urls` | `links`, `url` | **Yes** | Enabled | Bare URL used without `<>` or markdown link `[]()`. |
| **MD035** | `hr-style` | `hr` | No | Enabled | Horizontal rule style (`style`: `consistent`, `---`). |
| **MD036** | `no-emphasis-as-heading` | `headings`, `emphasis` | No | Enabled | Emphasis (`**Bold**`) used on a line by itself instead of a real heading. |
| **MD037** | `no-space-in-emphasis` | `whitespace`, `emphasis` | **Yes** | Enabled | Spaces inside emphasis markers (`* italic *` $\rightarrow$ `*italic*`). |
| **MD038** | `no-space-in-code` | `whitespace`, `code` | **Yes** | Enabled | Spaces inside code span elements (`` ` code ` `` $\rightarrow$ `` `code` ``). |
| **MD039** | `no-space-in-links` | `whitespace`, `links` | **Yes** | Enabled | Spaces inside link text (`[ link ](url)` $\rightarrow$ `[link](url)`). |
| **MD040** | `fenced-code-language` | `code`, `language` | No | Enabled | Fenced code blocks must specify a language identifier (`text`, `bash`, `json`, etc.). |
| **MD041** | `first-line-heading` / `first-line-h1` | `headings` | No | Enabled | First line in file must be a top-level heading (`level`: 1). Front matter is ignored. |
| **MD042** | `no-empty-links` | `links` | No | Enabled | Links with empty target `[text]()`. |
| **MD043** | `required-headings` | `headings` | No | Disabled | Enforce exact required heading sequence (`headings`: array of patterns). |
| **MD044** | `proper-names` | `spelling` | **Yes** | Disabled | Enforce proper casing for defined names (`names`: array of strings, `code_blocks`: true). |
| **MD045** | `no-alt-text` | `accessibility`, `images` | No | Enabled | Images must provide alternate text (`alt_text`). |
| **MD046** | `code-block-style` | `code` | No | Enabled | Code block style consistency (`style`: `consistent`, `fenced`, `indented`). |
| **MD047** | `single-trailing-newline` | `whitespace`, `blank_lines` | **Yes** | Enabled | File must end with exactly one trailing newline character. |
| **MD048** | `code-fence-style` | `code` | No | Enabled | Code fence style consistency (`style`: `consistent`, `backtick`, `tilde`). |
| **MD049** | `emphasis-style` | `emphasis` | **Yes** | Enabled | Emphasis style consistency (`style`: `consistent`, `asterisk`, `underscore`). |
| **MD050** | `strong-style` | `emphasis` | **Yes** | Enabled | Strong style consistency (`style`: `consistent`, `asterisk`, `underscore`). |
| **MD051** | `link-fragments` | `links` | **Yes** | Enabled | Link fragments `#anchor` must match a real heading anchor slug in the document (`ignore_case`: false). |
| **MD052** | `reference-links-images` | `links`, `images` | No | Enabled | Reference links and images must use defined labels (`[label][ref]`). |
| **MD053** | `link-image-reference-definitions` | `links`, `images` | **Yes** | Enabled | Link and image reference definitions must be used (`ignored_definitions`: []). |
| **MD054** | `link-image-style` | `links`, `images` | **Yes** | Enabled | Link and image style (`autolink`, `inline`, `full`, `collapsed`, `shortcut`, `url_inline`). |
| **MD055** | `table-pipe-style` | `table` | No | Enabled | Table pipe style (`style`: `consistent`, `leading_and_trailing`). |
| **MD056** | `table-column-count` | `table` | No | Enabled | Table rows must have the same column count as header and delimiter rows. |
| **MD058** | `blanks-around-tables` | `table`, `blank_lines` | **Yes** | Enabled | Tables must be surrounded by blank lines. |
| **MD059** | `descriptive-link-text` | `accessibility`, `links` | No | Enabled | Link text should be descriptive (disallows "click here", "here", "more", "link"). |
| **MD060** | `table-column-style` | `table` | No | **Disabled** | Table column padding and alignment. Set `false` in config. |
