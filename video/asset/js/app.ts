class App {
    private webAR: WebAR;

    constructor() {
        // 认证token,请从开发中心获取
        const token = 'YTU5NjgxYzU1NDAxM2ZiNWQ0OGMxOGY5Yjk2ZThlYjYxNzY2M2EwOGQ5NmIzMTYzZjYwZDkxOTQwODk2NTc2ZHsiYWNjZXNzS2V5IjoiODg3ZjE2MmFlYTY4NDk0OGE3OTI1MzNkNWZlZjY0NmQiLCJleHBpcmVzIjozMjc4MjM0NzU5NTk4fQ==';
        this.webAR = new WebAR('https://iss-cn1.wujianar.com', token, 1000);
        if (window.VConsole) new VConsole();
    }

    public run(): void {
        window.onload = () => {
            if (this.isWeiXin() && this.isIos()) {
                this.openPage('page1', 'page3');
                return;
            }
        };

        // 点击扫描
        let isOpening = false;
        document.querySelector('#btnScan').addEventListener('click', () => {
            this.toast('摄像头打开中...');
            if (isOpening) {
                return;
            }

            isOpening = true;
            this.webAR.tryCamera().then(msg => {
                isOpening = false;
                this.openPage('page1', 'page2');

                // 开始识别
                this.search();
            }).catch(err => {
                isOpening = false;
                console.info('打开摄像头失败');
                console.error(err);
                alert('打开摄像头失败');
            });
        });

        // 点击直接体验
        document.querySelector('#btnShow').addEventListener('click', () => {
            this.openPage('page1', 'page4');
            this.showVideo({'videoUrl': 'asset/videos/demo.mp4'});
        });

        // 关闭按钮
        document.querySelector('#btnCloseShow').addEventListener('click', () => {
            this.removeVideo();
            this.hideTarget('#btnCloseShow');
            this.search();
        });
    }

    /**
     * 识别
     */
    private search(): void {
        this.webAR.startSearch((msg: any) => {
            this.toast('识别成功');
            this.showTarget('#btnCloseShow');
            this.openPage('page2', 'page4');

            // 识别成功,播放视频
            // 建议将视频地址保存在云识别的brief字段中,可以在服务端动态更换视频地址
            this.showVideo(JSON.parse(msg.brief));
            // this.showVideo({'videoUrl': 'asset/videos/demo.mp4'});
        });
    }

    private showVideo(setting: any): void {
        this.playVideo(setting.videoUrl, true);
    }


    private removeVideo(): void {
        this.openPage('page4', 'page2');
        const video: HTMLMediaElement = document.querySelector('#showVideo');
        video.pause();
        video.removeAttribute('src');
    }

    private playVideo(videoUrl: string, autoPlay: boolean = true): void {
        const video: HTMLMediaElement = document.querySelector('#showVideo');
        video.setAttribute('src', videoUrl);

        video.play().then(() => {
            console.info('视频播放成功');
        }).catch((err) => {
            console.info('视频播放失败');
            console.info(err);
        });

        if (!autoPlay) {
            window.setTimeout(() => {
                video.pause();
            }, 50);
        }
    }

    private isIos(): boolean {
        return /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    }

    private isWeiXin(): boolean {
        return /micromessenger/.test(navigator.userAgent.toLowerCase())
    }

    private hideTarget(target: string): void {
        document.querySelector(target).classList.add('hide');
    }

    private showTarget(target: string): void {
        document.querySelector(target).classList.remove('hide');
    }

    private openPage(from: string, to: string): void {
        if (from != '') {
            document.querySelector(`#${from}`).classList.add('hide');
        }

        if (to != '') {
            document.querySelector(`#${to}`).classList.remove('hide');
        }
    }

    private toast(text: string, delay = 2000): void {
        const el = document.createElement('div');
        el.setAttribute('class', 'toast');
        el.innerHTML = text;
        document.body.append(el);
        setTimeout(() => {
            document.body.removeChild(el);
        }, delay);
    }
}

(new App()).run();