<script lang="ts">
    export let placeholder: string = "Enter your name";
    export let maxlength: number = 20;
</script>

<input on:input type="text" {placeholder} {maxlength} autocapitalize="words" class="text-2xl border-2 border-neutral-300 rounded-md p-3 italic">