import { writable } from 'svelte/store';
import Alert__SvelteComponent_ from './Alert.svelte';
export const content = writable("")
export const popup = writable(null)
import { bind } from 'svelte-simple-modal';

let val;
export async function show_popup(message, form = true) {
    popup.set(bind(Alert__SvelteComponent_, {
        message,
        form
    }))
    await waitForCondition()
}

export async function waitForCondition() {
    const unsub = popup.subscribe((value) => {val = value})
    async function checkFlag() {
        if (val == null) {
            console.log("finished",val)
            unsub()
            return new Promise(resolve => setTimeout(resolve, 100));
        } else {
            console.log("waiting")
            await new Promise(resolve => setTimeout(resolve, 1000));
             return await checkFlag();
      }
    }
    return await checkFlag()
}