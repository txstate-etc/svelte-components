# [ScreenReaderOnly](./../src/lib/components/ScreenReaderOnly.svelte)
This component is for adding text that can be read to screen readers while remaining
invisible to regular users. It accepts `arialive` and `ariaatomic` props to pass through to
the corresponding HTML attributes. It also accepts an `id` prop in case you need to
point at it with an aria-describedby attribute on some other element.

Using this component is often better than using aria-label because aria-label still has poor support
and sometimes is not good enough to make WAVE happy with an empty icon-link. It's also a
good way to add additional text when sighted users have a little text already, e.g. to add
interactivity instructions.
