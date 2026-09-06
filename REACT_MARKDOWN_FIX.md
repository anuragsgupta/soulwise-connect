# ReactMarkdown className Error Fix

## Problem
React-markdown v9+ no longer accepts the `className` prop directly. The old approach caused this error:

```
Unexpected `className` prop, remove it
(see github.com/remarkjs/react-markdown/blob/main/changelog.md#remove-classname)
```

## Solution
Replace the `className` prop with the `components` prop to customize styling for markdown elements.

### What Changed

**Before (Broken):**
```jsx
<ReactMarkdown className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0 prose-ul:my-1 prose-ol:my-1">
  {msg.content}
</ReactMarkdown>
```

**After (Fixed):**
```jsx
// Step 1: Define markdown components with styles
const markdownComponents: Components = {
  p: ({ children }) => <p className="my-1">{children}</p>,
  li: ({ children }) => <li className="my-0">{children}</li>,
  ul: ({ children }) => <ul className="my-1 list-disc list-inside">{children}</ul>,
  ol: ({ children }) => <ol className="my-1 list-decimal list-inside">{children}</ol>,
  h1: ({ children }) => <h1 className="text-lg font-bold my-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-base font-bold my-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-bold my-1">{children}</h3>,
  code: ({ children }) => <code className="bg-gray-100 px-1 rounded text-xs">{children}</code>,
  pre: ({ children }) => <pre className="bg-gray-100 p-2 rounded my-1 overflow-x-auto text-xs">{children}</pre>,
  blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-2 my-1 italic">{children}</blockquote>,
};

// Step 2: Use components prop instead of className
<ReactMarkdown components={markdownComponents}>
  {msg.content}
</ReactMarkdown>
```

## Files Modified
- `src/components/chat/ChatbotTab.tsx` - Fixed ReactMarkdown usage

## Component Styling Details

The `markdownComponents` object maps each markdown element to a styled React component:

| Element | Styling | Purpose |
|---------|---------|---------|
| `p` | `my-1` | Paragraph spacing |
| `li` | `my-0` | List item spacing |
| `ul` | `list-disc list-inside` | Unordered list with bullets |
| `ol` | `list-decimal list-inside` | Ordered list with numbers |
| `h1`, `h2`, `h3` | Various font sizes and bold | Heading hierarchy |
| `code` | `bg-gray-100 px-1 rounded text-xs` | Inline code styling |
| `pre` | `bg-gray-100 p-2 overflow-x-auto` | Code block styling |
| `blockquote` | `border-l-4 italic` | Quote styling |

## Testing
The fix was applied to `src/components/chat/ChatbotTab.tsx`. Test by:
1. Navigate to the chatbot tab
2. Send a message with markdown formatting (bold, lists, code blocks, etc.)
3. Verify the markdown is rendered correctly without the className error

## Reference
- React-markdown changelog: https://github.com/remarkjs/react-markdown/blob/main/changelog.md#remove-classname
- React-markdown components guide: https://github.com/remarkjs/react-markdown#components
