import { Button } from "@/components/ui/button";

interface QuickAction {
  text: string;
  icon: React.ElementType;
}

interface QuickActionsProps {
  quickActions: QuickAction[];
  handleQuickAction: (text: string) => void;
}

const QuickActions = ({ quickActions, handleQuickAction }: QuickActionsProps) => (
  <div className="mb-4">
    <p className="text-sm text-muted-foreground mb-2">Quick actions:</p>
    <div className="flex flex-wrap gap-2">
      {quickActions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => handleQuickAction(action.text)}
          className="text-xs hover:bg-primary/10 hover:text-primary hover:border-primary transition-all duration-200 hover:scale-105"
        >
          <action.icon className="w-3 h-3 mr-1" />
          {action.text}
        </Button>
      ))}
    </div>
  </div>
);

export default QuickActions;
