import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Smile, Paperclip } from "lucide-react";

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  handleSendMessage: () => void;
  isTyping: boolean;
}

const ChatInput = ({ inputMessage, setInputMessage, handleSendMessage, isTyping }: ChatInputProps) => (
  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
    {/* Emoji/Attachment buttons */}
    <Button 
      variant="ghost" 
      size="icon"
      className="h-9 w-9 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full flex-shrink-0"
      disabled={isTyping}
    >
      <Smile className="w-5 h-5" />
    </Button>
    
    {/* Input field */}
    <Input
      placeholder="Type a message..."
      value={inputMessage}
      onChange={(e) => setInputMessage(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSendMessage()}
      className="flex-1 bg-white border-0 focus-visible:ring-1 focus-visible:ring-teal-500 rounded-full px-4 py-2 h-10 transition-all duration-200"
      disabled={isTyping}
    />
    
    {/* Send button - WhatsApp style */}
    <Button 
      onClick={handleSendMessage} 
      disabled={!inputMessage.trim() || isTyping}
      size="icon"
      className={`h-10 w-10 rounded-full flex-shrink-0 transition-all duration-200 ${
        inputMessage.trim() 
          ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg hover:scale-105' 
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
