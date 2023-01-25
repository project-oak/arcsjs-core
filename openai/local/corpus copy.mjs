export const corpus =
`Apply a shader effect to a camera feed.
{
  "CameraNode1": {
    "type": "CameraNode"
  },
  "FragmentShaderNode1": {
    "type": "FragmentShaderNode",
    "connections": {
      "image": ["CameraNode1:frame"]
    }
  },
  "ImageNode1": {
    "type": "ImageNode",
    "connections": {
      "connectedImage": ["FragmentShaderNode1:outputImage"]
    }
  }
}

On a camera feed, put a sticker on my face.
{
  "CameraNode1": {
    "type": "CameraNode"
  },
  "FaceMeshNode1": {
    "type": "FaceMeshNode",
    "connections": {
      "image": ["CameraNode1:frame"]
    }
  },
  "FaceMeshStickerNode1": {
    "type": "FaceMeshStickerNode",
    "connections": {
      "data": ["FaceMeshNode1:data"],
      "sticker": ["ImageNode1:image"]
    }
  },
  "ImageNode1": {
    "type": "ImageNode"
  }
}

Identify an object in an image.
{
  "ImageNode1": {
    "type": "ImageNode",
    "connections": {},
    "props": {
      "image": {
        "url": "kitten.png"
      }
    }
  },
  "CocoSsdNode1": {
    "type": "CocoSsdNode",
    "connections": {
      "image": ["ImageNode1:image"]
    }
  },
  "JsonViewerNode1": {
    "type": "JsonViewerNode",
    "connections": {
      "json": ["CocoSsdNode1:data"]
    }
  }
}

Identify something in an image.
{
  "ImageNode1": {
    "type": "ImageNode",
    "props": {
      "image": {
        "url": "dog.jpg"
      }
    }
  },
  "MobilenetNode1": {
    "type": "MobilenetNode",
    "connections": {
      "ImageNode": ["ImageNode1:image"]
    }
  },
  "BarDisplayNode1": {
    "type": "BarDisplayNode",
    "connections": {
      "ClassifierResults": ["MobilenetNode1:ClassifierResults"]
    }
  }
}

Create a name and email entry form.
{
  "TextFieldNode1": {
    "type": "TextFieldNode",
    "props": {
      "label": "First Name"
    }
  },
  "TextFieldNode2": {
    "type": "TextFieldNode",
    "props": {
      "label": "Last Name"
    }
  },
  "TextFieldNode3": {
    "type": "TextFieldNode",
    "props": {
      "label": "Email"
    }
  }
}

Get and display my longitude.
{
  "GoogleMapsNode1": {
    "type": "Google Maps"
  },
  "JSONataNode1": {
    "type": "JSONataNode",
    "connections": {
      "json": ["GoogleMapsNode1:geolocation"]
    },
    "props": {
      "expression": "longitude"
    }
  },
  "StaticTextNode1": {
    "type": "StaticTextNode",
    "connections": {
      "text": ["JSONataNode1:result"]
      "textStyle": []
    }
  }
}`;