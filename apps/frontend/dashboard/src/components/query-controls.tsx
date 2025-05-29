import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Grid } from 'lucide-react';
import { useState } from 'react';

export const QueryControls = () => {
  const [displayType, setDisplayType] = useState('lines');
  const [strokeStyle, setStrokeStyle] = useState('solid');
  const [strokeWidth, setStrokeWidth] = useState('normal');
  const [colorScheme, setColorScheme] = useState('classic');
  const [orderBy, setOrderBy] = useState('tags');
  const [reverse, setReverse] = useState(false);
  const [splitGraph, setSplitGraph] = useState(false);
  const [oneGraphPerQuery, setOneGraphPerQuery] = useState(false);

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Grid className="w-5 h-5 text-blue-500" />
          Display Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium text-gray-700">Display</Label>
            <Select value={displayType} onValueChange={setDisplayType}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="lines">Lines</SelectItem>
                <SelectItem value="bars">Bars</SelectItem>
                <SelectItem value="area">Area</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Style</Label>
            <Select value={strokeStyle} onValueChange={setStrokeStyle}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Stroke</Label>
            <Select value={strokeWidth} onValueChange={setStrokeWidth}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="thin">Thin</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="thick">Thick</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Color</Label>
            <Select value={colorScheme} onValueChange={setColorScheme}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="classic">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                    Classic
                  </div>
                </SelectItem>
                <SelectItem value="warm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded"></div>
                    Warm
                  </div>
                </SelectItem>
                <SelectItem value="cool">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded"></div>
                    Cool
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Order by</Label>
            <Select value={orderBy} onValueChange={setOrderBy}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="tags">Tags</SelectItem>
                <SelectItem value="value">Value</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <Label htmlFor="reverse" className="text-sm font-medium text-gray-700">Reverse</Label>
            <Switch id="reverse" checked={reverse} onCheckedChange={setReverse} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="split-graph" className="text-sm font-medium text-gray-700">Split Graph</Label>
            <Switch id="split-graph" checked={splitGraph} onCheckedChange={setSplitGraph} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="one-graph" className="text-sm font-medium text-gray-700">One graph per query</Label>
            <Switch id="one-graph" checked={oneGraphPerQuery} onCheckedChange={setOneGraphPerQuery} />
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200 space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full hover:bg-gray-50"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Save to Dashboard
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full hover:bg-gray-50"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Create Alert
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};