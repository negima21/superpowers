param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Args
)

& node "$PSScriptRoot\markdown-tool.cjs" @Args
