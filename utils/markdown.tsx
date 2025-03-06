import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function MarkdownRenderer({ children }) {
  return <Markdown 
    components={{
      h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
      h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />,
      h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
    }}
  remarkPlugins={[remarkGfm]}>{children}
  
  </Markdown>
}