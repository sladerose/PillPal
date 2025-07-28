# Gemini Git Commit Notes

This document outlines common issues encountered when committing changes via the `git commit -m` command within the Gemini CLI environment, and the recommended workaround.

## Problem:

When attempting to commit with a multi-line message or a message containing special characters (like backticks or newlines) directly using `git commit -m "Your message here"`, the command often fails with errors such as:

- `error: pathspec '...' did not match any file(s) known to git`
- `Command substitution using $(), <(), or >() is not allowed for security reasons` (when backticks are present)

This occurs because the shell environment within the CLI might misinterpret the commit message string, especially with newlines or unescaped special characters, leading to incorrect parsing of the `git commit` command.

## Solution: Using `git commit -F` with a temporary file

The most reliable method to ensure complex or multi-line commit messages are correctly passed to Git is to write the message to a temporary file and then use the `git commit -F` (or `--file`) option.

**Steps:**

1.  **Write the commit message to a temporary file:**
    Use the `write_file` tool to create a temporary file (e.g., `commit_message.txt`) containing your desired commit message. Ensure the content is exactly as you want it to appear in the commit.

    Example (using a placeholder for the actual tool call):
    ```
    write_file(file_path="commit_message.txt", content="""
    feat: Your feature description

    This is a detailed commit message explaining:
    - Point 1
    - Point 2
    - Point 3
    """)
    ```

2.  **Commit using the temporary file:**
    Once the file is created, use the `run_shell_command` tool with `git commit -F` to read the message from the file.

    Example:
    ```
    run_shell_command(command="git commit -F commit_message.txt", description="Commit changes with message from file")
    ```

3.  **Clean up (Optional but Recommended):**
    After a successful commit, you can delete the temporary commit message file.

    Example:
    ```
    run_shell_command(command="del commit_message.txt", description="Delete temporary commit message file")
    ```

This approach bypasses shell interpretation issues by providing the commit message directly to Git from a file, ensuring accuracy and preventing errors.