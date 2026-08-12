import React, { useState, useEffect } from 'react';
import { useFileStore } from '../../store/useFileStore';
import { Save, FolderOpen, FileText } from 'lucide-react';

const TextEditorApp = () => {
  const { files, updateFile, createFile } = useFileStore();
  const [content, setContent] = useState('');
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);

  const textFiles = Object.values(files).filter(f => f.type === 'file' && (!f.mimeType || f.mimeType.startsWith('text/')));

  useEffect(() => {
    if (activeFileId && files[activeFileId]) {
      setContent(files[activeFileId].content || '');
      setUnsavedChanges(false);
    }
  }, [activeFileId]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (activeFileId) {
      await updateFile(activeFileId, { content });
      setUnsavedChanges(false);
    } else {
      const newId = await createFile({
        name: `Untitled-${Date.now()}.txt`,
        type: 'file',
        parentId: 'desktop',
        content,
        mimeType: 'text/plain'
      });
      setActiveFileId(newId);
      setUnsavedChanges(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent">
      <div className="flex items-center space-x-2 px-4 py-2 bg-white/40 dark:bg-black/20 border-b border-gray-200/50 dark:border-gray-700/50">
        <button
          onClick={() => setShowFilePicker(!showFilePicker)}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Open File"
        >
          <FolderOpen size={16} className="text-gray-700 dark:text-gray-300" />
        </button>
        <button
          onClick={handleSave}
          className={`p-1.5 rounded transition-colors ${unsavedChanges ? 'text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          title="Save File"
        >
          <Save size={16} />
        </button>
        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-2" />
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {activeFileId ? files[activeFileId]?.name : 'Untitled'} {unsavedChanges && '*'}
        </div>
      </div>

      <div className="flex-1 relative flex">
        {showFilePicker && (
          <div className="w-48 bg-gray-50 dark:bg-[#252525] border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Text Files</div>
            {textFiles.length === 0 ? (
              <div className="p-4 text-xs text-gray-400 text-center">No text files found.</div>
            ) : (
              textFiles.map(file => (
                <button
                  key={file.id}
                  onClick={() => {
                    setActiveFileId(file.id);
                    setShowFilePicker(false);
                  }}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-sm text-left hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${activeFileId === file.id ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  <FileText size={14} />
                  <span className="truncate">{file.name}</span>
                </button>
              ))
            )}
            <div className="p-2">
              <button
                onClick={() => {
                  setActiveFileId(null);
                  setContent('');
                  setShowFilePicker(false);
                }}
                className="w-full text-xs py-1.5 text-center border border-dashed border-gray-300 dark:border-gray-600 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                + New File
              </button>
            </div>
          </div>
        )}

        <textarea
          value={content}
          onChange={handleContentChange}
          className="flex-1 w-full h-full p-4 resize-none outline-none border-none bg-transparent text-gray-800 dark:text-gray-200 font-mono text-sm leading-relaxed"
          placeholder="Start typing here..."
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default TextEditorApp;
