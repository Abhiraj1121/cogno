import React, { useState } from 'react';
import { useFileStore, type FileNode } from '../../store/useFileStore';
import { Folder, FileText, Image as ImageIcon, Trash2, Home, Download, Upload, Plus, File as FileIcon } from 'lucide-react';

const FileManagerApp = () => {
  const { files, createFile, softDeleteFile, updateFile, deleteFile } = useFileStore();
  const [currentFolderId, setCurrentFolderId] = useState<string>('desktop');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const folders = [
    { id: 'desktop', name: 'Desktop', icon: Home },
    { id: 'documents', name: 'Documents', icon: Folder },
    { id: 'downloads', name: 'Downloads', icon: Download },
    { id: 'trash', name: 'Trash', icon: Trash2 },
  ];

  const currentFiles = Object.values(files).filter(f => f.parentId === currentFolderId);
  const isTrash = currentFolderId === 'trash';

  const handleCreateFolder = async () => {
    const name = prompt('Folder name:');
    if (name) {
      await createFile({ name, type: 'folder', parentId: currentFolderId });
    }
  };

  const handleRename = async (id: string, currentName: string) => {
    const name = prompt('New name:', currentName);
    if (name) {
      await updateFile(id, { name });
    }
  };

  const handleDelete = async (id: string) => {
    if (isTrash) {
      if (confirm('Permanently delete this item?')) {
        await deleteFile(id);
      }
    } else {
      await softDeleteFile(id);
    }
  };

  const handleRestore = async (id: string) => {
    await updateFile(id, { parentId: 'desktop' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    for (const file of Array.from(e.target.files)) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const content = e.target?.result as string;
        await createFile({
          name: file.name,
          type: 'file',
          parentId: currentFolderId,
          content,
          mimeType: file.type
        });
      };

      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
  };

  const renderIcon = (file: FileNode) => {
    if (file.type === 'folder') return <Folder size={32} className="text-blue-400 mb-2" fill="currentColor" />;
    if (file.mimeType?.startsWith('image/')) {
      return (
        <div className="w-12 h-12 mb-2 rounded overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          {file.content ? (
            <img src={file.content} alt={file.name} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={24} className="text-gray-400" />
          )}
        </div>
      );
    }
    if (file.mimeType?.startsWith('text/')) return <FileText size={32} className="text-gray-500 mb-2" />;
    return <FileIcon size={32} className="text-gray-400 mb-2" />;
  };

  return (
    <div className="flex h-full w-full bg-transparent text-gray-800 dark:text-gray-200">

      <div className="w-48 bg-white/40 dark:bg-black/20 border-r border-gray-200/50 dark:border-gray-700/50 p-2 flex flex-col">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2 pt-2">Favorites</div>
        {folders.map(folder => (
          <button
            key={folder.id}
            onClick={() => setCurrentFolderId(folder.id)}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${currentFolderId === folder.id ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            <folder.icon size={16} className={currentFolderId === folder.id ? 'text-blue-500' : 'text-gray-400'} />
            <span>{folder.name}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col min-w-0">

        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="font-semibold text-lg">{folders.find(f => f.id === currentFolderId)?.name || 'Folder'}</div>

          <div className="flex items-center space-x-2">
            {!isTrash && (
              <>
                <button onClick={handleCreateFolder} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors" title="New Folder">
                  <Plus size={18} />
                </button>
                <label className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer" title="Upload File">
                  <Upload size={18} />
                  <input type="file" className="hidden" multiple onChange={handleFileUpload} />
                </label>
              </>
            )}
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500'}`}
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-current rounded-[2px]" /><div className="bg-current rounded-[2px]" />
                  <div className="bg-current rounded-[2px]" /><div className="bg-current rounded-[2px]" />
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500'}`}
              >
                <div className="w-4 h-4 flex flex-col justify-between">
                  <div className="h-1 w-full bg-current rounded-[1px]" />
                  <div className="h-1 w-full bg-current rounded-[1px]" />
                  <div className="h-1 w-full bg-current rounded-[1px]" />
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {currentFiles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Folder size={48} className="mb-4 opacity-50 text-gray-300 dark:text-gray-600" />
              <p>This folder is empty</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {currentFiles.map(file => (
                <div
                  key={file.id}
                  className="flex flex-col items-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group relative"
                  onDoubleClick={() => {
                    if (file.type === 'folder') setCurrentFolderId(file.id);
                  }}
                >
                  {renderIcon(file)}
                  <span className="text-xs text-center break-words w-full px-1 line-clamp-2">{file.name}</span>

                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex flex-col bg-white dark:bg-gray-700 rounded shadow-md border border-gray-200 dark:border-gray-600">
                    <button onClick={(e) => { e.stopPropagation(); handleRename(file.id, file.name); }} className="px-2 py-1 text-[10px] hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600">Rename</button>
                    {isTrash && <button onClick={(e) => { e.stopPropagation(); handleRestore(file.id); }} className="px-2 py-1 text-[10px] hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 text-green-500">Restore</button>}
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }} className="px-2 py-1 text-[10px] hover:bg-gray-100 dark:hover:bg-gray-600 text-red-500">{isTrash ? 'Delete forever' : 'Delete'}</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-6">Name</div>
                <div className="col-span-3">Date Modified</div>
                <div className="col-span-3">Kind</div>
              </div>
              {currentFiles.map(file => (
                <div
                  key={file.id}
                  className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 items-center text-sm cursor-pointer group relative"
                  onDoubleClick={() => {
                    if (file.type === 'folder') setCurrentFolderId(file.id);
                  }}
                >
                  <div className="col-span-6 flex items-center space-x-3 truncate">
                    <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                      {file.type === 'folder' ? <Folder size={16} className="text-blue-400" fill="currentColor" /> : <FileText size={16} className="text-gray-400" />}
                    </div>
                    <span className="truncate">{file.name}</span>
                  </div>
                  <div className="col-span-3 text-gray-500 text-xs">{new Date(file.updatedAt).toLocaleDateString()}</div>
                  <div className="col-span-3 text-gray-500 text-xs flex justify-between items-center">
                    <span>{file.type === 'folder' ? 'Folder' : (file.mimeType || 'Document')}</span>

                    <div className="opacity-0 group-hover:opacity-100 flex bg-white dark:bg-gray-700 rounded shadow-sm border border-gray-200 dark:border-gray-600">
                      <button onClick={(e) => { e.stopPropagation(); handleRename(file.id, file.name); }} className="px-2 py-1 text-[10px] hover:bg-gray-100 dark:hover:bg-gray-600 border-r border-gray-200 dark:border-gray-600">Rename</button>
                      {isTrash && <button onClick={(e) => { e.stopPropagation(); handleRestore(file.id); }} className="px-2 py-1 text-[10px] hover:bg-gray-100 dark:hover:bg-gray-600 border-r border-gray-200 dark:border-gray-600 text-green-500">Restore</button>}
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }} className="px-2 py-1 text-[10px] hover:bg-gray-100 dark:hover:bg-gray-600 text-red-500">Del</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileManagerApp;
