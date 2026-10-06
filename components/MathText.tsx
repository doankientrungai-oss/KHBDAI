import React from 'react';
import { parseMathTokens } from '../utils/mathUtils';

interface MathTextProps {
  text: string;
  className?: string;
}

export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

  const tokens = parseMathTokens(text);

  return (
    <span className={className}>
      {tokens.map((token, idx) => {
        if (token.type === 'text') {
          return <React.Fragment key={idx}>{token.content}</React.Fragment>;
        }

        if (token.renderedHtml) {
          const isBlock = token.type === 'block-math';
          return (
            <span
              key={idx}
              className={isBlock ? "block my-2 text-center overflow-x-auto" : "inline px-0.5 my-0"}
              dangerouslySetInnerHTML={{ __html: token.renderedHtml }}
            />
          );
        }

        return <React.Fragment key={idx}>{token.content}</React.Fragment>;
      })}
    </span>
  );
};

export default MathText;
