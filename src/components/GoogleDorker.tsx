
import { useState } from "react";
import { Copy, Search, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Define the Google Dork operators
const dorkOperators = [
  { value: "site", label: "site:", description: "Search within a specific website" },
  { value: "intitle", label: "intitle:", description: "Pages with a specific word in the title" },
  { value: "inurl", label: "inurl:", description: "Pages with a specific word in the URL" },
  { value: "filetype", label: "filetype:", description: "Files of a specific type" },
  { value: "intext", label: "intext:", description: "Pages containing specific text" },
  { value: "cache", label: "cache:", description: "View Google's cached version of a specific page" },
  { value: "link", label: "link:", description: "Pages that link to a specific URL" },
  { value: "related", label: "related:", description: "Pages that are related to a specific URL" },
  { value: "after", label: "after:", description: "Pages indexed after a specific date" },
  { value: "before", label: "before:", description: "Pages indexed before a specific date" },
  { value: "ext", label: "ext:", description: "Files with a specific extension" },
  { value: "allintext", label: "allintext:", description: "Pages containing all specified terms" },
  { value: "allinurl", label: "allinurl:", description: "URLs containing all specified terms" },
  { value: "allintitle", label: "allintitle:", description: "Titles containing all specified terms" },
];

// Define predefined templates
const predefinedTemplates = [
  { 
    name: "Exposed Documents", 
    query: "filetype:pdf OR filetype:doc OR filetype:xlsx OR filetype:txt",
    description: "Search for potentially exposed documents" 
  },
  { 
    name: "WordPress Config", 
    query: "filetype:php intext:DB_PASSWORD",
    description: "Search for exposed WordPress configuration files" 
  },
  { 
    name: "Directory Listing", 
    query: 'intitle:"Index of" -inurl:(jsp|php|html|asp)',
    description: "Find exposed directory listings" 
  },
  { 
    name: "Login Pages", 
    query: 'intitle:"login" inurl:admin',
    description: "Find admin login pages" 
  },
  { 
    name: "Error Pages", 
    query: 'intext:"sql syntax near" | intext:"syntax error has occurred" | intext:"incorrect syntax near" | intext:"unexpected end of SQL command" | intext:"Warning: mysql_connect()" | intext:"Warning: mysql_query()" | intext:"Warning: pg_connect()"',
    description: "Find error pages that might reveal sensitive information" 
  },
];

export function GoogleDorker() {
  const [selectedOperator, setSelectedOperator] = useState("");
  const [keywords, setKeywords] = useState("");
  const [generatedQuery, setGeneratedQuery] = useState("");
  const [activeTab, setActiveTab] = useState("custom");

  const handleGenerateQuery = () => {
    let query = "";
    
    if (activeTab === "custom") {
      if (!keywords) {
        toast({
          title: "Input required",
          description: "Please enter keywords or a search term",
          variant: "destructive",
        });
        return;
      }
      
      if (selectedOperator) {
        const operator = dorkOperators.find(op => op.value === selectedOperator);
        query = `${operator?.label || ""} ${keywords}`;
      } else {
        query = keywords;
      }
    } else {
      // Template tab is active
      const template = predefinedTemplates.find(t => t.name === activeTab);
      if (template) {
        query = template.query;
        if (keywords) {
          query = `${keywords} ${query}`;
        }
      }
    }
    
    setGeneratedQuery(query);
  };

  const handleSearch = () => {
    if (!generatedQuery) {
      handleGenerateQuery();
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

  const handleTemplateSelect = (templateName: string) => {
    setActiveTab(templateName);
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="custom" className="flex-1">Custom Query</TabsTrigger>
              {predefinedTemplates.map((template) => (
                <TabsTrigger 
                  key={template.name} 
                  value={template.name} 
                  className="hidden md:flex"
                  onClick={() => handleTemplateSelect(template.name)}
                >
                  {template.name}
                </TabsTrigger>
              ))}
              <TabsTrigger value="templates" className="flex md:hidden">Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Enter keywords or search terms..."
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Select value={selectedOperator} onValueChange={setSelectedOperator}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Google Dork operator" />
                  </SelectTrigger>
                  <SelectContent>
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
            </TabsContent>
            
            <TabsContent value="templates" className="md:hidden space-y-4">
              <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedTemplates.map((template) => (
                    <SelectItem key={template.name} value={template.name}>
                      <div className="flex flex-col">
                        <span>{template.name}</span>
                        <span className="text-xs text-muted-foreground">{template.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>
            
            {predefinedTemplates.map((template) => (
              <TabsContent key={template.name} value={template.name} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Add additional keywords (optional)..."
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="p-4 bg-secondary rounded-md">
                  <p className="font-medium">{template.name}</p>
                  <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                  <code className="text-sm bg-background p-2 rounded block overflow-x-auto">{template.query}</code>
                </div>
              </TabsContent>
            ))}
          </Tabs>
          
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
          <CardTitle>Google Dork Operators Guide</CardTitle>
          <CardDescription>
            Quick reference for common Google search operators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dorkOperators.slice(0, 8).map((operator) => (
              <div key={operator.value} className="p-3 border rounded-md">
                <p className="font-semibold">{operator.label}</p>
                <p className="text-sm text-muted-foreground">{operator.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
