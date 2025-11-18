import Markdown from "react-markdown";

export default function MarkdownText({text}: {text: string}) {
    return (
        <Markdown components={{
            strong(props) {
                const {node, ...rest} = props;
                return <strong className="font-bold" {...rest}></strong>
            }
        }}>
            {text}
        </Markdown>
    );
}