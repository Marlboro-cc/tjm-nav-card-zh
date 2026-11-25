# TJM 仪表盘导航卡片 · 简体中文

适用于宝马 iDrive 7 的仪表盘导航卡片。在仪表盘地图上叠加下一次转向、距离、路名和车道提示。应用标识为 `cluster_nav_card`，中文版版本为 **0.9.204**。

![离线渲染的导航卡片：450 米后左转，莘庄立交](docs/preview.png)

## 车机商店

在支持 GitHub 源码构建的 MGU Store 中添加 GitHub 来源 `Marlboro-cc/tjm-nav-card-zh`，选择 **main 分支**。在应用列表中选择 **TJM 仪表盘导航卡片** 并核对版本。商店按仓库中的 `mgu-repo.json` 调用构建脚本，使用车机本机的 BMW oap-sdk。相同应用标识的旧版本会和此版占用同一应用位置。

原版依赖 Waze on cluster 提供仪表地图、cluster-render 提供叠加图层；这两项需由原有来源提供。导航指引来自手机、宝马原车导航或导航文件。Waze 应用自身不提供本卡片所需的转向指引。

安装后，可在停车时启用 **设置 → 演示路线**，检查地图上的中文转向卡片，再关闭演示并测试实际路线。此版本已通过电脑端离线验证，车机商店安装和实车显示仍待验证。

## 中文显示

菜单、选项、导航状态、演示路线和距离单位已汉化。路名按导航源的原文绘制。界面使用 UTF-8 字符串资源；诊断页保留中文，长路名根据实际像素宽度截断。

保留原有字体，缺字时再从补充点阵字库取字。补充范围为 U+3400–U+9FFF、U+F900–U+FAFF 和 U+FF01–U+FF60，覆盖基本汉字、扩展 A、兼容表意文字及常用全角符号。其他扩展区的生僻字可能显示为问号。

## 本地验证

在仓库根目录使用 Python 3 和 Node.js 运行：

```sh
python3 kit/tools/build.py --preview-only cluster_nav_card
node tests/chinese.js
```

测试从构建后的目录读取资源，检查菜单、汉字像素、软件画布、GPU 绘制指令回放、车机和文件数据输入、长路名以及诊断文字。真实安装包由车机商店或配有合法本机 SDK 的构建环境生成。

## 来源与许可

- 基于 [TJM Nav Card 0.9.2 源码](https://github.com/tjmodsss/tjm-apps/tree/b891d1c08ba1710dd90f45fdc14fa27e995ec151/apps/cluster_nav_card)，保留原卡片的仪表盘图层、设置键和导航协议。原始作者与导入记录见 [NOTICE-TJM.md](apps/cluster_nav_card/NOTICE-TJM.md)，原应用采用 MIT 许可证。
- TJM 所用应用框架的中文翻译署名见 [NOTICE.zh-CN.md](NOTICE.zh-CN.md)。渲染客户端保留 [MPL 2.0 许可证](apps/cluster_nav_card/MPL-2.0.txt)。
- 路名补充字库来自 [GNU Unifont 16.0.04](https://unifoundry.com/pub/unifont/unifont-16.0.04/)，按 SIL Open Font License 1.1 分发。许可证随字库存放在 [fonts](kit/runtime/fonts) 中。使用 `python3 tools/bake-road-font.py unifont-16.0.04.hex.gz` 可重新生成点阵数据。
