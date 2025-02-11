// 根据文件扩展名获取对应的内容类型
const getContentType = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const types: Record<string, string> = {
    'js': 'application/javascript',
    'css': 'text/css',
    'html': 'text/html',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif'
  };
  return types[ext] || 'text/plain'; // 返回未知扩展名的默认内容类型
};

// 处理传入的 HTTP 请求
async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  console.log('Request URL:', req.url); // 记录请求的 URL

  try {
    let filePath = url.pathname;
    
    // 如果请求根路径或 index.html，默认返回 index.html
    if (filePath === '/' || filePath === '/index.html') {
      filePath = '/index.html';
    }

    const userAgent = req.headers.get('User-Agent') || ''; // 获取用户代理
    let fullPath: string;

    // 根据用户代理确定文件的完整路径
    if (
      userAgent.includes('okhttp/3.15') ||
      userAgent.includes('okhttp/4.12') ||
      userAgent.includes('okhttp/4.50') // 处理特定的 okhttp 版本
    ) {
      fullPath = `${Deno.cwd()}/interface${filePath}`; // 对应接口路径
    } else {
      fullPath = `${Deno.cwd()}/static${filePath}`; // 对应静态文件路径
    }

    const file = await Deno.readFile(fullPath); // 读取文件
    const contentType = getContentType(filePath); // 获取内容类型

    // 返回读取的文件及其内容类型
    return new Response(file, {
      headers: {
        'content-type': `${contentType};charset=UTF-8`,
      },
    });
  } catch (e) {
    console.error('Error details:', e); // 记录错误信息
    return new Response('Not Found', { 
      status: 404, // 返回404状态
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
      }
    });
  }
}

// 启动 Deno 服务以处理请求
Deno.serve(handleRequest);
