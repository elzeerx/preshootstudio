import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ProjectDetail } from '@/hooks/useProjectDetail';

interface ProjectContentViewerProps {
  project: ProjectDetail;
}

export function ProjectContentViewer({ project }: ProjectContentViewerProps) {
  return (
    <Tabs defaultValue="research" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="research">البحث</TabsTrigger>
        <TabsTrigger value="scripts">السكريبتات</TabsTrigger>
        <TabsTrigger value="prompts">المطالبات</TabsTrigger>
        <TabsTrigger value="broll">B-Roll</TabsTrigger>
        <TabsTrigger value="article">المقال</TabsTrigger>
      </TabsList>

      <ScrollArea className="h-[400px] mt-4">
        <TabsContent value="research">
          {project.research_data ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>الملخص</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{project.research_data.summary || 'لا يوجد ملخص'}</p>
                </CardContent>
              </Card>

              {project.research_data.keyPoints && project.research_data.keyPoints.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>النقاط الرئيسية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1">
                      {project.research_data.keyPoints.map((point, idx) => (
                        <li key={idx} className="text-sm">{point}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {project.research_data.sources && project.research_data.sources.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>المصادر ({project.research_data.sources.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {project.research_data.sources.map((source, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Badge variant="outline">{source.type || 'other'}</Badge>
                          <span className="text-sm">{source.title}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">لا توجد بيانات بحثية</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scripts">
          {project.scripts_data ? (
            <div className="space-y-4">
              {project.scripts_data.teleprompter && (
                <Card>
                  <CardHeader>
                    <CardTitle>سكريبت التيليبرومبتر</CardTitle>
                    <CardDescription>
                      المدة المقدرة: {project.scripts_data.teleprompter.estimatedDurationSec} ثانية
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {project.scripts_data.teleprompter.lines?.map((line, idx) => (
                        <p key={idx} className="text-sm">{line}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {project.scripts_data.reel && (
                <Card>
                  <CardHeader>
                    <CardTitle>سكريبت الريل</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <Badge>Hook</Badge>
                        <p className="text-sm mt-1">{project.scripts_data.reel.hook}</p>
                      </div>
                      <div>
                        <Badge>Body Points</Badge>
                        <ul className="list-disc list-inside mt-1">
                          {project.scripts_data.reel.bodyPoints?.map((point, idx) => (
                            <li key={idx} className="text-sm">{point}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <Badge>Outro</Badge>
                        <p className="text-sm mt-1">{project.scripts_data.reel.outro}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">لا توجد سكريبتات</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="prompts">
          {project.prompts_data ? (
            <div className="space-y-4">
              {project.prompts_data.imagePrompts && project.prompts_data.imagePrompts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>مطالبات الصور ({project.prompts_data.imagePrompts.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.prompts_data.imagePrompts.map((prompt, idx) => (
                        <div key={idx} className="border-l-2 border-primary pl-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{prompt.model}</Badge>
                            <Badge>{prompt.aspectRatio}</Badge>
                          </div>
                          <p className="text-sm font-medium">{prompt.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">{prompt.prompt}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {project.prompts_data.videoPrompts && project.prompts_data.videoPrompts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>مطالبات الفيديو ({project.prompts_data.videoPrompts.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.prompts_data.videoPrompts.map((prompt, idx) => (
                        <div key={idx} className="border-l-2 border-secondary pl-3">
                          <p className="text-sm font-medium">{prompt.label}</p>
                          <p className="text-xs text-muted-foreground">المدة: {prompt.durationSec}s</p>
                          <p className="text-xs mt-1">{prompt.prompt}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">لا توجد مطالبات</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="broll">
          {project.broll_data ? (
            <div className="space-y-4">
              {project.broll_data.shots && project.broll_data.shots.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>لقطات B-Roll ({project.broll_data.shots.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.broll_data.shots.map((shot, idx) => (
                        <div key={idx} className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge>{shot.shotType}</Badge>
                            <Badge variant="outline">{shot.cameraMovement}</Badge>
                            <span className="text-xs text-muted-foreground">{shot.durationSec}s</span>
                          </div>
                          <p className="text-sm font-medium">{shot.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{shot.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">لا توجد بيانات B-Roll</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="article">
          {project.article_data ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{project.article_data.title}</CardTitle>
                  <CardDescription>{project.article_data.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{project.article_data.intro}</p>
                  
                  {project.article_data.sections && project.article_data.sections.map((section, idx) => (
                    <div key={idx} className="mb-4">
                      <h4 className="font-semibold mb-2">{section.heading}</h4>
                      <p className="text-sm text-muted-foreground">{section.body}</p>
                    </div>
                  ))}
                  
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm">{project.article_data.conclusion}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">لا توجد مقالة</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
}
