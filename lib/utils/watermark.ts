export const addWatermark = (file: File, watermarkText = "Corona Marine Parts") => {
  return new Promise<File>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) return reject("Could not get canvas context");

        const MAX_WIDTH = 1920;
        const scale = Math.min(1, MAX_WIDTH / img.width);

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const fontSize = canvas.width / 35; // Medium font size
        const opacity = 0.10; // Subtle but visible
        const spacing = canvas.width / 3; // Balanced spacing
        const angle = -35 * (Math.PI / 180);

        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = `rgba(255,255,255,${opacity})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);

        for (let x = -canvas.width; x < canvas.width; x += spacing) {
          for (let y = -canvas.height; y < canvas.height; y += spacing) {
            ctx.fillText(watermarkText, x, y);
          }
        }

        ctx.restore();

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject("Canvas export failed");

            const watermarkedFile = new File(
              [blob],
              file.name.replace(/\.\w+$/, ".jpg"),
              { type: "image/jpeg" }
            );

            resolve(watermarkedFile);
          },
          "image/jpeg",
          0.85
        );
      };

      img.onerror = () => reject("Failed to load image");
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
};
