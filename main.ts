// 根据文件扩展名获取对应的内容类型
const getContentType = (path: string): string => {
  // 获取文件扩展名并转换为小写
  const ext = path.split('.').pop()?.toLowerCase() || '';
  
  // 定义不同文件扩展名对应的内容类型
  const types: Record<string, string> = {
    'js': 'application/javascript',
    'css': 'text/css',
    'html': 'text/html',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
  };

  // 返回对应的内容类型，若不匹配则返回默认的文本类型
  return types[ext] || 'text/plain';
};

// 处理传入的 HTTP 请求
async function handleRequest(req: Request): Promise<Response> {
  // 获取请求的 URL
  const url = new URL(req.url);
  console.log('Request URL:', req.url); // 记录请求的 URL

  try {
    let filePath = url.pathname;
    
    // 如果请求根路径或 index.html，默认返回 index.html
    if (filePath === '/' || filePath === '/index.html') {
      filePath = '/index.html';
    }

    // 获取用户代理信息
    const userAgent = req.headers.get('User-Agent') || '';
    let fullPath: string;

    // 根据用户代理决定文件的完整路径
    if (
      userAgent.includes('okhttp/3.15') ||
      userAgent.includes('okhttp/4.12') ||
      userAgent.includes('okhttp/4.50') // 针对特定 userAgent 的处理
    ) {
      filePath = '/main.json'; // 接口文件
      fullPath = `${Deno.cwd()}/interface${filePath}`; // 接口路径
    } else {
      fullPath = `${Deno.cwd()}/static${filePath}`; // 静态文件路径
    }

    // 读取文件
    const file = await Deno.readFile(fullPath);
    const contentType = getContentType(filePath); // 获取内容类型

    // 返回读取的文件和内容类型
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
      },
    });
  }
}

// 启动 Deno 服务以处理请求
Deno.serve(handleRequest);
