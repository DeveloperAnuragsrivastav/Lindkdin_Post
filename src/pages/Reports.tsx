import { useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, FileText, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSubmissions } from "@/hooks/useSubmissions";

const Reports = () => {
  const { submissions, loading } = useSubmissions();

  const stats = useMemo(() => {
    const uniqueTopics = new Set(submissions.map(s => s.topic)).size;
    const uniquePrompts = new Set(submissions.map(s => s.prompt)).size;
    
    return {
      totalSubmissions: submissions.length,
      uniqueTopics,
      uniquePrompts,
    };
  }, [submissions]);

  const getTopicCount = (topic: string) => {
    return submissions.filter(s => s.topic === topic).length;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
            <SidebarTrigger className="hover:bg-accent/50" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Reports</h1>
              <p className="text-sm text-muted-foreground">Track your prompt submissions and usage</p>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
                    <p className="text-xs text-muted-foreground">Total prompts sent</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unique Topics</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.uniqueTopics}</div>
                    <p className="text-xs text-muted-foreground">Different topics covered</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unique Prompts</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.uniquePrompts}</div>
                    <p className="text-xs text-muted-foreground">Different prompts used</p>
                  </CardContent>
                </Card>
              </div>

              {/* Submissions Table */}
              <Card className="border-border/50">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="text-xl">Submission History</CardTitle>
                  <CardDescription>Complete log of all your prompt submissions</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-6 text-center text-muted-foreground">
                      Loading submissions...
                    </div>
                  ) : submissions.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      No submissions yet. Start by sending a prompt from the Dashboard.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">#</TableHead>
                            <TableHead>Topic</TableHead>
                            <TableHead>Prompt Preview</TableHead>
                            <TableHead className="w-[100px]">Count</TableHead>
                            <TableHead className="w-[180px]">Date & Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {submissions.map((submission, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{submissions.length - index}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{submission.topic}</Badge>
                              </TableCell>
                              <TableCell className="max-w-md">
                                <p className="text-sm text-muted-foreground truncate">
                                  {submission.prompt.substring(0, 80)}...
                                </p>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{getTopicCount(submission.topic)}x</Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDate(submission.timestamp)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Reports;
