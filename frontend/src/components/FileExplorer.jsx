import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { 
  Folder, 
  File, 
  FileText, 
  Code, 
  Image, 
  Plus, 
  MoreVertical,
  Edit,
  Trash2,
  Download,
  Copy
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const FileExplorer = ({ 
  files = [], 
  onFileSelect, 
  onFileCreate, 
  onFileDelete, 
  onFileRename,
  onFileDownload,
  selectedFile = null 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [editingFile, setEditingFile] = useState(null);
  const [newFileName, setNewFileName] = useState('');

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <Code className="h-4 w-4 text-blue-500" />;
      case 'html':
      case 'css':
      case 'scss':
      case 'sass':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'json':
      case 'xml':
      case 'yaml':
      case 'yml':
        return <FileText className="h-4 w-4 text-yellow-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <Image className="h-4 w-4 text-purple-500" />;
      case 'md':
      case 'txt':
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <File className="h-4 w-4 text-gray-400" />;
    }
  };

  const getLanguageFromFilename = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'py':
        return 'python';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      default:
        return 'text';
    }
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFolder = (folderPath) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileSelect = (file) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleCreateFile = () => {
    const filename = prompt('Enter filename:');
    if (filename && onFileCreate) {
      onFileCreate(filename);
    }
  };

  const handleRename = (file) => {
    setEditingFile(file);
    setNewFileName(file.name);
  };

  const handleRenameSubmit = () => {
    if (editingFile && newFileName && onFileRename) {
      onFileRename(editingFile, newFileName);
      setEditingFile(null);
      setNewFileName('');
    }
  };

  const handleDelete = (file) => {
    if (confirm(`Are you sure you want to delete "${file.name}"?`) && onFileDelete) {
      onFileDelete(file);
    }
  };

  const renderFileTree = (items, level = 0) => {
    return items.map((item) => {
      const isFolder = item.type === 'folder';
      const isExpanded = expandedFolders.has(item.path);
      const isSelected = selectedFile?.path === item.path;
      const isEditing = editingFile?.path === item.path;

      return (
        <div key={item.path}>
          <div
            className={`flex items-center space-x-2 px-2 py-1 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${
              isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
            style={{ paddingLeft: `${level * 20 + 8}px` }}
          >
            {isFolder ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => toggleFolder(item.path)}
              >
                <Folder className="h-3 w-3 text-blue-500" />
              </Button>
            ) : (
              getFileIcon(item.name)
            )}
            
            {isEditing ? (
              <div className="flex items-center space-x-1 flex-1">
                <Input
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSubmit();
                    if (e.key === 'Escape') setEditingFile(null);
                  }}
                  className="h-6 text-sm"
                  autoFocus
                />
                <Button size="sm" onClick={handleRenameSubmit} className="h-6 px-2">
                  Save
                </Button>
              </div>
            ) : (
              <div 
                className="flex items-center justify-between flex-1"
                onClick={() => !isFolder && handleFileSelect(item)}
              >
                <span className="text-sm truncate">{item.name}</span>
                {!isFolder && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRename(item)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onFileDownload?.(item)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.content || '')}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Content
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(item)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
          </div>
          
          {isFolder && isExpanded && item.children && (
            <div className="ml-4">
              {renderFileTree(item.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Files</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCreateFile}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Input
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-8 text-sm"
        />
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64">
          <div className="p-2">
            {filteredFiles.length > 0 ? (
              renderFileTree(filteredFiles)
            ) : (
              <div className="text-center py-8 text-slate-500">
                <File className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No files found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default FileExplorer;