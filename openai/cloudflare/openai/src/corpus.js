globalThis.corpus =`
Find an image of a puppy and a kitten.
{
  "ImageNode1": {
    "type": "PixabayNode",
    "props": {
      "query": "puppy+and+a+kitten"
    }
  },
  "ImageDisplayNode1": {
    "type": "ImageNode",
    "connections": {
      "connectedImage": ["ImageNode1:image"]
    }
  }
}

See my camera.
{
  "CameraNode1": {
    "type": "CameraNode"
  }
}

Take a picture with my camera.
{
  "CameraNode1": {
    "type": "CameraNode",
    "props": {
      "fps": "1"
    }
  },
  "ImageDisplayNode1": {
    "type": "ImageNode",
    "connections": {
      "connectedImage": ["CameraNode1:frame"]
    }
  }
}

Apply and show a facemesh on my face.
{
  "CameraNode1": {
    "id": "CameraNode1",
    "type": "CameraNode",
    "displayName": "Camera",
    "connections": {}
  },
  "FaceMesh1": {
    "id": "FaceMesh1",
    "type": "FaceMesh",
    "displayName": "Face Mesh",
    "connections": {
      "image": [
        "CameraNode1:frame"
      ]
    }
  },
  "FaceMeshFace1": {
    "id": "FaceMeshFace1",
    "type": "FaceMeshFace",
    "displayName": "Face Display",
    "connections": {
      "data": [
        "FaceMesh1:data"
      ]
    }
  }
}

Put a sticker on my face
{
  "CameraNode1": {
    "id": "CameraNode1",
    "type": "CameraNode",
    "displayName": "Camera",
    "connections": {}
  },
  "FaceMesh1": {
    "id": "FaceMesh1",
    "type": "FaceMesh",
    "displayName": "Face Mesh",
    "connections": {
      "image": [
        "CameraNode1:frame"
      ]
    }
  },
  "FaceMeshSticker1": {
    "id": "FaceMeshSticker1",
    "type": "FaceMeshSticker",
    "displayName": "Face Sticker",
    "connections": {
      "data": [
        "FaceMesh1:data"
      ],
      "sticker": []
    }
  }
}

Find an image of a cute dog and apply it as a sticker on my face
{
  "CameraNode1": {
    "id": "CameraNode1",
    "type": "CameraNode",
    "displayName": "Camera",
    "connections": {}
  },
  "FaceMesh1": {
    "id": "FaceMesh1",
    "type": "FaceMesh",
    "displayName": "Face Mesh",
    "connections": {
      "image": [
        "CameraNode1:frame"
      ]
    }
  },
  "FaceMeshSticker1": {
    "id": "FaceMeshSticker1",
    "type": "FaceMeshSticker",
    "displayName": "Face Sticker",
    "connections": {
      "data": [
        "FaceMesh1:data"
      ],
      "sticker": [
        "ImageNode1:image"
      ]
    }
  },
  "PixabayNode1": {
    "id": "PixabayNode1",
    "type": "PixabayNode",
    "displayName": "Pixabay Image Search",
    "connections": {},
    "props": {
      "query": "cute dog"
    }
  },
  "ImageNode1": {
    "id": "ImageNode1",
    "type": "ImageNode",
    "displayName": "Image",
    "connections": {
      "connectedImage": [
        "PixabayNode1:image"
      ]
    }
  }
}

Replace my background with the default image
{
  "CameraNode1": {
    "id": "CameraNode1",
    "type": "CameraNode",
    "displayName": "Camera",
    "connections": {}
  },
  "SelfieSegmentation1": {
    "id": "SelfieSegmentation1",
    "type": "SelfieSegmentation",
    "displayName": "Selfie Segmentation",
    "connections": {
      "image": [
        "CameraNode1:frame"
      ]
    }
  },
  "ImageCompositeNode1": {
    "id": "ImageCompositeNode1",
    "type": "ImageCompositeNode",
    "displayName": "Image Composite",
    "connections": {
      "imageA": [
        "CameraNode1:frame"
      ],
      "imageB": [
        "SelfieSegmentation1:mask"
      ]
    },
    "props": {
      "opA": "source-in",
      "opB": "destination-atop"
    }
  },
  "ImageNode1": {
    "id": "ImageNode1",
    "type": "ImageNode",
    "displayName": "ImageNode",
    "connections": {
      "connectedImage": [
        "ImageCompositeNode2:output"
      ]
    }
  },
  "ImageNode2": {
    "id": "ImageNode2",
    "type": "ImageNode",
    "displayName": "ImageNode 2",
    "connections": {}
  },
  "ImageCompositeNode2": {
    "id": "ImageCompositeNode2",
    "type": "ImageCompositeNode",
    "displayName": "Image Composite 2",
    "connections": {
      "imageA": [
        "ImageNode2:image"
      ],
      "imageB": [
        "ImageCompositeNode1:output"
      ]
    },
    "props": {
      "opA": "source-over"
    }
  }
}

Send a picture to my wife.
{
  "SendPrivateImageNode": {
    "type": "PrivateSendNode",
    "props": {
      "sendTo": "wife",
      "data": ["ImageNode1:image"]
    }
  }
}

Send a picture to Mastodon.
{
  "SendPublicImageNode": {
    "type": "PublicSendNode",
    "props": {
      "sendTo": "mastodon",
      "data": ["ImageNode1:image"]
    }
  }
}

Show my camera with a shader effect.
{
  "CameraNode1": {
    "id": "CameraNode1",
      "type": "CameraNode",
        "connections": {}
  },
    "FragmentShader1": {
      "id": "FragmentShader1",
        "type": "FragmentShader",
          "connections": {
            "image": [
              "CameraNode1:frame"
            ]
          }
    }
}

Tell me what is in an image.
{
  "MobilenetNode1": {
    "id": "MobilenetNode1",
    "type": "MobilenetNode",
    "displayName": "MobilenetNode",
    "connections": {
      "Image": [
        "ImageNode1:image"
      ]
    }
  },
  "BarDisplayNode1": {
    "id": "BarDisplayNode1",
    "type": "BarDisplayNode",
    "displayName": "Bar Display",
    "connections": {
      "ClassifierResults": [
        "MobilenetNode1:ClassifierResults"
      ]
    }
  },
  "ImageNode1": {
    "id": "ImageNode1",
    "type": "ImageNode",
    "displayName": "ImageNode",
    "connections": {}
  }
}

`;