from __future__ import annotations

import torch
import torch.nn as nn
from torchvision import models


class CSRNet(nn.Module):
    """CSRNet architecture matching rootstrap-org/crowd-counting / leeyeehoo weights."""

    def __init__(self) -> None:
        super().__init__()
        self.frontend_feat = [64, 64, "M", 128, 128, "M", 256, 256, 256, "M", 512, 512, 512]
        self.backend_feat = [512, 512, 512, 256, 128, 64]
        self.frontend = make_layers(self.frontend_feat)
        self.backend = make_layers(self.backend_feat, in_channels=512, dilation=True)
        self.output_layer = nn.Conv2d(64, 1, kernel_size=1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.frontend(x)
        x = self.backend(x)
        x = self.output_layer(x)
        return x


def make_layers(
    cfg: list,
    in_channels: int = 3,
    batch_norm: bool = False,
    dilation: bool = False,
) -> nn.Sequential:
    d_rate = 2 if dilation else 1
    layers: list[nn.Module] = []
    for v in cfg:
        if v == "M":
            layers.append(nn.MaxPool2d(kernel_size=2, stride=2))
        else:
            conv2d = nn.Conv2d(in_channels, v, kernel_size=3, padding=d_rate, dilation=d_rate)
            if batch_norm:
                layers.extend([conv2d, nn.BatchNorm2d(v), nn.ReLU(inplace=True)])
            else:
                layers.extend([conv2d, nn.ReLU(inplace=True)])
            in_channels = int(v)
    return nn.Sequential(*layers)


def load_vgg_frontend(model: CSRNet) -> None:
    """Optional VGG init when weights file lacks frontend (not needed for full checkpoint)."""
    vgg = models.vgg16(weights=models.VGG16_Weights.IMAGENET1K_V1)
    frontend_dict = model.frontend.state_dict()
    vgg_items = list(vgg.features.state_dict().items())
    for i, key in enumerate(frontend_dict.keys()):
        frontend_dict[key].data[:] = vgg_items[i][1].data[:]
    model.frontend.load_state_dict(frontend_dict)
