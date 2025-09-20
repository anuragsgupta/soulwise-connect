import React from 'react';

interface FormattedMessageProps {
  content: string;
  className?: string;
}

const FormattedMessage: React.FC<FormattedMessageProps> = ({ content, className = "" }) => {
  const formatContent = (text: string) => {
    // Split text into lines for processing
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    
    lines.forEach((line, index) => {
      if (line.trim() === '') {
        elements.push(<br key={`br-${index}`} />);
        return;
      }
      
      // Handle numbered lists (1. 2. 3.)
      if (/^\d+\.\s/.test(line.trim())) {
        const content = line.replace(/^\d+\.\s/, '');
        elements.push(
          <div key={index} className="ml-4 mb-1">
            <span className="font-medium text-primary">{line.match(/^\d+\./)?.[0]}</span>
            <span className="ml-2">{formatInlineText(content)}</span>
          </div>
        );
        return;
      }
      
      // Handle bullet points (• or -)
      if (/^[•\-]\s/.test(line.trim())) {
        const content = line.replace(/^[•\-]\s/, '');
        elements.push(
          <div key={index} className="ml-4 mb-1 flex items-start">
            <span className="text-primary mr-2 mt-0.5">•</span>
            <span>{formatInlineText(content)}</span>
          </div>
        );
        return;
      }
      
      // Handle headers (lines that end with :)
      if (line.trim().endsWith(':') && line.trim().length > 1) {
        elements.push(
          <div key={index} className="font-semibold text-gray-800 mt-2 mb-1">
            {formatInlineText(line)}
          </div>
        );
        return;
      }
      
      // Regular text
      elements.push(
        <div key={index} className="mb-1">
          {formatInlineText(line)}
        </div>
      );
    });
    
    return elements;
  };
  
  const formatInlineText = (text: string) => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    
    // Handle **bold** text
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the bold
      if (match.index > currentIndex) {
        parts.push(text.slice(currentIndex, match.index));
      }
      
      // Add bold text
      parts.push(
        <strong key={`bold-${match.index}`} className="font-semibold text-gray-900">
          {match[1]}
        </strong>
      );
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.slice(currentIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };
  
  return (
    <div className={`formatted-message ${className}`}>
      {formatContent(content)}
    </div>
  );
};

export default FormattedMessage;