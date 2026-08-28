#!/bin/bash

set -uo pipefail

run_id="${1:?run id required}"
runner="${2:?runner required}"
model="${3:?model required}"
run_root="/Users/tomas/development/webmcp-challenge/docs/ideation-runs/2026-08-27-multi-agent"
prompt_file="$run_root/prompt.md"
output_file="$run_root/outputs/$run_id.md"
status_file="$run_root/status/$run_id.exit"
work_dir="/private/tmp/webmcp-ideation-2026-08-27/$run_id"

mkdir -p "$run_root/outputs" "$run_root/status" "$work_dir"
cd "$work_dir" || exit 70

run_prompt="$(<"$prompt_file")"
run_prompt="$run_prompt

Independent run identifier: $run_id. Do not refer to the identifier in the product ideas."

if [[ "$runner" == "cursor" ]]; then
  fnox run -- agent --yolo --model "$model" -p "$run_prompt" 2>&1 | tee "$output_file"
  agent_status="${PIPESTATUS[0]}"
elif [[ "$runner" == "claude" ]]; then
  fnox run -- claude --dangerously-skip-permissions --model "$model" --effort medium -p "$run_prompt" 2>&1 | tee "$output_file"
  agent_status="${PIPESTATUS[0]}"
else
  printf 'unknown runner: %s\n' "$runner" | tee "$output_file"
  agent_status=64
fi

printf '%s\n' "$agent_status" > "$status_file"
exit "$agent_status"
