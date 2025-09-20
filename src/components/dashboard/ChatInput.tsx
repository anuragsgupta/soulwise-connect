import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  handleSendMessage: () => void;
  isTyping: boolean;
}

const ChatInput = ({ inputMessage, setInputMessage, handleSendMessage, isTyping }: ChatInputProps) => (
  <div className="flex space-x-2">
    <Input
      placeholder="Share what's on your mind..."
      value={inputMessage}
      onChange={(e) => setInputMessage(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSendMessage()}
      className="flex-1 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
      disabled={isTyping}
    />
    <Button 
      onClick={handleSendMessage} 
      disabled={!inputMessage.trim() || isTyping}
      className={`bg-gradient-to-r from-primary to-wellness hover:from-primary/90 hover:to-wellness/90 transition-all duration-200 ${
        isTyping ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
      }`}
    >
      {isTyping ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <Send className="w-4 h-4" />
      )}
    </Button>
  </div>
);

export default ChatInput;
