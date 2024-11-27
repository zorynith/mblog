import React, { useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from "~/components/ui/button";

const ImageOverlay = ({ image, onClose, onUpload, onSave }) => {
  // 使用 useEffect 控制 body 的滚动状态
  useEffect(() => {
    // 禁用页面滚动
    document.body.style.overflow = 'hidden';

    // 在组件卸载时恢复页面滚动
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
    
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white w-screen h-screen mx-0 rounded-none shadow-lg flex flex-col overflow-hidden">
      {/* 1. 标题和关闭按钮 */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{image.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

       {/* 2. 图片显示 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="w-full h-56 flex items-center justify-center">
            <img 
              src={image.src} 
              alt={image.title} 
              className="w-full h-full object-contain"
            />
          </div>

          {/* 3. 上传区域 */}
          <div className="p-4 border-t border-b">
          <h3 className="font-semibold mb-2">上传脸部照片</h3>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400"
              onClick={onUpload}
            >
              <Upload className="mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">点击上传脸部照片</p>
            </div>
          </div>

          {/* 4. 文字说明 */}
          <div className="p-4">
            <h3 className="font-semibold mb-2">注意事项</h3>
            <p className="text-sm text-gray-600">
              1、素材仅供AI使用，绝无外泄风险，请放心使用。<br/>
              2、素材需清晰，小于2Mb，上传间隔大于60秒。<br/>
              3、本功能不支持多人图片。<br/>
              4、生成失败返回免费次数，免费次数若违规则作废。<br/>
              5、禁止使用未成年人图片！
            </p>
          </div>
        </div>

        {/* 5. 底部操作栏 */}
        <div className="p-4 border-t flex justify-between items-center">
          <p className="text-sm text-gray-600">消耗金币：10 免费次数：0</p>
          <Button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-md"onClick={onSave}>立即制作</Button>
        </div>
      </div>
    </div>
  );
};

export default ImageOverlay;