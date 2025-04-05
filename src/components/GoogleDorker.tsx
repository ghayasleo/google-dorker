import { useState } from "react";
import { Copy, Search, ExternalLink, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const dorkOperators = [
  { value: "empty", label: '""', description: "Empty string search", requiresValue: true, valueFormat: "" },
  { value: "or", label: "OR", description: "Search for either term", requiresValue: false, valueFormat: "" },
  { value: "and", label: "AND", description: "Search for both terms", requiresValue: false, valueFormat: "" },
  { value: "exclude", label: "-", description: "Exclude a term from results", requiresValue: true, valueFormat: "" },
  { value: "wildcard", label: "*", description: "Wildcard character for any text", requiresValue: false, valueFormat: "" },
  { value: "site", label: "site:", description: "Search within a specific website", requiresValue: true, valueFormat: "" },
  { value: "inurl", label: "inurl:", description: "Pages with a specific word in the URL", requiresValue: true, valueFormat: "" },
  { value: "allinurl", label: "allinurl:", description: "URLs containing all specified terms", requiresValue: true, valueFormat: "" },
  { value: "intitle", label: "intitle:", description: "Pages with a specific word in the title", requiresValue: true, valueFormat: "" },
  { value: "allintitle", label: "allintitle:", description: "Titles containing all specified terms", requiresValue: true, valueFormat: "" },
  { value: "filetype", label: "filetype:", description: "Files of a specific type", requiresValue: true, valueFormat: "" },
  { value: "ext", label: "ext:", description: "Files with a specific extension", requiresValue: true, valueFormat: "" },
  { value: "indexof", label: "index of", description: "Directory listings", requiresValue: true, valueFormat: "" },
  { value: "intext", label: "intext:", description: "Pages containing specific text", requiresValue: true, valueFormat: "" },
  { value: "allintext", label: "allintext:", description: "Pages containing all specified terms", requiresValue: true, valueFormat: "" },
];

interface OperatorQuery {
  id: string;
  operator: string;
  value: string;
}

export function GoogleDorker() {
  const [keywords, setKeywords] = useState("");
  const [generatedQuery, setGeneratedQuery] = useState("");
  
  const [operatorQueries, setOperatorQueries] = useState<OperatorQuery[]>([
    { id: crypto.randomUUID(), operator: "", value: "" }
  ]);

  const addOperatorQuery = () => {
    setOperatorQueries([
      ...operatorQueries, 
      { id: crypto.randomUUID(), operator: "", value: "" }
    ]);
  };

  const removeOperatorQuery = (id: string) => {
    if (operatorQueries.length > 1) {
      setOperatorQueries(operatorQueries.filter(query => query.id !== id));
    } else {
      toast({
        title: "Cannot remove",
        description: "You need at least one operator field",
        variant: "destructive",
      });
    }
  };

  const updateOperatorQuery = (id: string, field: 'operator' | 'value', newValue: string) => {
    setOperatorQueries(
      operatorQueries.map(query => 
        query.id === id ? { ...query, [field]: newValue } : query
      )
    );
  };

  const validateOperatorInputs = () => {
    const invalidOperators = operatorQueries.filter(query => {
      if (!query.operator) return false; // Skip empty operators
      
      const operator = dorkOperators.find(op => op.value === query.operator);
      return operator?.requiresValue && !query.value.trim();
    });
    
    if (invalidOperators.length > 0) {
      toast({
        title: "Missing input value",
        description: "Please provide a value for all operators that require one",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleGenerateQuery = () => {
    const hasValidOperator = operatorQueries.some(
      query => query.operator
    );

    if (!hasValidOperator && !keywords) {
      toast({
        title: "Input required",
        description: "Please enter keywords or at least one complete operator query",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateOperatorInputs()) {
      return;
    }
    
    const operatorParts = operatorQueries
      .filter(query => query.operator)
      .map(query => {
        const operator = dorkOperators.find(op => op.value === query.operator);
        
        if (!operator) return "";
        
        // For operators that don't require a value, just return the label
        if (!operator.requiresValue) {
          return operator.label;
        }
        
        // For operators that require a value, combine with the user input
        if (query.value.trim() === "") {
          return ""; // Skip if no value is provided for operators that need one
        }
        
        // Special formatting for quotes
        if (operator.value === "empty") {
          return `"${query.value}"`;
        }
        
        // Special formatting for exclude
        if (operator.value === "exclude") {
          return `-${query.value}`;
        }
        
        // Default formatting for most operators (append value)
        return `${operator.label}${query.value}`;
      })
      .filter(part => part !== ""); // Remove any empty parts
    
    const queryParts = keywords ? [keywords, ...operatorParts] : operatorParts;
    const query = queryParts.join(" ");
    
    setGeneratedQuery(query);
  };

  const handleSearch = () => {
    if (!generatedQuery) {
      if (!validateOperatorInputs()) {
        return;
      }
      
      handleGenerateQuery();
      
      // Give a short timeout to allow query generation
      setTimeout(() => {
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(keywords || "")}`;
        window.open(googleSearchUrl, "_blank");
      }, 100);
      
      return;
    }
    
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(generatedQuery)}`;
    window.open(googleSearchUrl, "_blank");
  };

  const copyToClipboard = () => {
    if (!generatedQuery) {
      toast({
        title: "Nothing to copy",
        description: "Generate a query first",
        variant: "destructive",
      });
      return;
    }
    
    navigator.clipboard.writeText(generatedQuery).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Query has been copied to your clipboard",
      });
    });
  };

  return (
    <div className="container max-w-3xl py-10 space-y-8">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center">
            Advanced Google Search Query Builder
          </CardTitle>
          <CardDescription className="text-center">
            Build powerful search queries using Google's advanced operators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Enter additional keywords (optional)..."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-4">
              {operatorQueries.map((query, index) => {
                const selectedOperator = dorkOperators.find(op => op.value === query.operator);
                
                return (
                  <div key={query.id} className="pb-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-shrink-0 w-full sm:w-auto">
                        <Select 
                          value={query.operator} 
                          onValueChange={(value) => updateOperatorQuery(query.id, 'operator', value)}
                        >
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {dorkOperators.map((operator) => (
                              <SelectItem key={operator.value} value={operator.value}>
                                <div className="flex flex-col">
                                  <span>{operator.label}</span>
                                  <span className="text-xs text-muted-foreground">{operator.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex-1 flex gap-2">
                        {selectedOperator?.requiresValue ? (
                          <Input
                            placeholder="Enter value..."
                            value={query.value}
                            onChange={(e) => updateOperatorQuery(query.id, 'value', e.target.value)}
                            className="flex-1"
                          />
                        ) : (
                          <div className="flex-1 flex items-center px-3 h-10 bg-muted/30 rounded-md text-sm text-muted-foreground">
                            {selectedOperator ? `No input needed for ${selectedOperator.label}` : 'Select an operator first'}
                          </div>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeOperatorQuery(query.id)}
                          className="flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {index < operatorQueries.length - 1 && (
                      <div className="my-4 py-2 px-4 bg-muted/20 rounded-md text-sm text-center text-muted-foreground block sm:hidden">
                        Operator #{index + 2}
                      </div>
                    )}
                    
                    {index < operatorQueries.length - 1 && (
                      <Separator className="my-4 hidden sm:block" />
                    )}
                  </div>
                );
              })}
              
              <Button 
                variant="outline" 
                onClick={addOperatorQuery} 
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Operator
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <Button onClick={handleGenerateQuery} className="flex-1">
              Generate Query
            </Button>
            <Button onClick={handleSearch} variant="secondary" className="flex-1">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
          
          {generatedQuery && (
            <div className="mt-6 p-4 bg-secondary rounded-md relative">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">Generated Query:</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={copyToClipboard} title="Copy to clipboard">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleSearch} title="Open in Google">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <code className="text-sm bg-background p-2 rounded block overflow-x-auto">
                {generatedQuery}
              </code>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <p className="text-xs text-muted-foreground">
            Google Dorking is a technique that uses advanced search operators to find information that might not be readily available through simple searches. Use responsibly.
          </p>
        </CardFooter>
      </Card>
      
      <Card className="border">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold">
            Google Dork Operators Guide
          </CardTitle>
          <CardDescription>
            Quick reference for common Google search operators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dorkOperators.map((operator) => (
              <div key={operator.value} className="p-3 border rounded-md">
                <p className="font-semibold">{operator.label}</p>
                <p className="text-sm text-muted-foreground">{operator.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {operator.requiresValue 
                    ? "Requires input" 
                    : "No additional input required"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
